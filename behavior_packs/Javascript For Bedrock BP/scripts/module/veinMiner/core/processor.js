import { BlockPermutation, system } from '@minecraft/server';
import { logError } from '../../../events/logger.js';
import { getBlockSafe } from '../../../shared/block.js';
import { getHeldItem } from './../../../shared/player.js';
import { Durability } from '../../../shared/durability.js';
import { CFG } from '../config.js';
import { ORE_XP } from '../data/ores.js';
import { JobQueue } from './queue.js';
import { pcheck } from './../../../shared/player.js';
import { finalizeAndCleanupState } from './lifecycle.js';

const NO_XP = [0];

let _airPermutation;

export const processVeinJobs = () => {
   const AIR = _airPermutation || (_airPermutation = BlockPermutation.resolve('minecraft:air'));
   try {
      const totalJobs = JobQueue.getJobQueueLength();
      if (totalJobs === 0) {
         JobQueue.setLastProcessedIndex(0);
         return;
      }

      const loadFactor = Math.max(1, Math.floor(totalJobs / 4));
      const blocksPerTick = Math.max(1, Math.ceil(CFG.blocksPerTickBase / loadFactor));
      const startTime = Date.now();

      let jobsDone = 0;
      let budgetChecked = 0;
      const maxJobs = Math.min(totalJobs, CFG.maxJobsPerTick);

      while (jobsDone < maxJobs && JobQueue.getJobQueueLength() > 0) {
         if (++budgetChecked % 4 === 0 && Date.now() - startTime > CFG.tickBudgetMs) break;
         let lastProcessedIndex = JobQueue.getLastProcessedIndex();
         if (lastProcessedIndex >= JobQueue.getJobQueueLength()) {
            lastProcessedIndex = 0;
            JobQueue.setLastProcessedIndex(0);
         }

         const job = JobQueue.getJob(lastProcessedIndex);
         if (!job) {
            JobQueue.popJob(lastProcessedIndex);
            continue;
         }

         if (!Array.isArray(job.locations) || typeof job.index !== 'number') {
            logError('VeinMiner', 'Dropping malformed job', {
               playerId: job.playerId,
               targetId: job.targetId,
               hasLocations: Array.isArray(job.locations),
               indexType: typeof job.index,
            });

            finalizeAndCleanupState(job);
            JobQueue.popJob(lastProcessedIndex);
            continue;
         }

         const curTick = system.currentTick;

         if (!pcheck(job.player) || curTick - job.startTick > CFG.jobTimeoutTicks) {
            finalizeAndCleanupState(job);
            JobQueue.popJob(lastProcessedIndex);
            continue;
         }

         const held = getHeldItem(job.player);
         if (!held || held.typeId !== job.pickaxeTypeId) {
            finalizeAndCleanupState(job);
            JobQueue.popJob(lastProcessedIndex);
            continue;
         }

         let broken = 0;
         let tickBlocksBroken = 0;
         let blockBudgetChecked = 0;
         while (broken < blocksPerTick && job.index < job.locations.length) {
            if (++blockBudgetChecked % 4 === 0 && Date.now() - startTime > CFG.tickBudgetMs) break;
            const loc = job.locations[job.index++];
            if (!loc || typeof loc.x !== 'number') continue;
            const block = getBlockSafe(job.dimension, loc);

            if (block && block.typeId === job.targetId) {
               const dropAmt = job.fortuneLevel > 0 ? Math.floor(Math.random() * job.fortuneLevel) + 2 : 1;
                const xpChoices = ORE_XP[job.targetId] || NO_XP;
               const xpAmt = xpChoices[Math.floor(Math.random() * xpChoices.length)];

               try {
                  block.setPermutation(AIR);
                  job.brokenCount += dropAmt;
                  job.xpAccumulated += xpAmt;
                  broken++;
                  tickBlocksBroken++;
               } catch (error) {
                  logError('VeinMiner', 'Error breaking block', error);
               }
            }
         }

         if (tickBlocksBroken > 0) {
            Durability.applyDurabilityDamage(job.player, held, tickBlocksBroken, job.unbreakingLevel);
         }

         if (job.index >= job.locations.length) {
            finalizeAndCleanupState(job);
            JobQueue.popJob(lastProcessedIndex);
         } else {
            JobQueue.incrementLastProcessedIndex();
         }

         jobsDone++;
      }
   } catch (e) {
      logError('VeinMiner', 'processVeinJobs crash', e);
   }
};
