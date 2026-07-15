import { BlockPermutation, system } from '@minecraft/server';

import { logError } from '../../../events/logger.js';
import { CFG } from '../config.js';
import { ORE_XP } from '../data/ores.js';
import { getBlockSafe } from '../../../shared/block.js';
import { Durability } from '../../../shared/durability.js';
import { getPlayerPickaxe } from '../utils/player.js';
import { finalizeAndCleanupState } from './lifecycle.js';
import { pcheck } from './../../../shared/player.js';
import { JobQueue } from '../../../shared/jobQueue.js';

let _airPermutation;

export const processVeinJobs = () => {
   const AIR = _airPermutation || (_airPermutation = BlockPermutation.resolve('minecraft:air'));
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
   const maxJobs = Math.min(totalJobs, 4);

   while (jobsDone < maxJobs && JobQueue.getJobQueueLength() > 0) {
      if (++budgetChecked % 4 === 0 && Date.now() - startTime > 5) break;
      let lastProcessedIndex = JobQueue.getLastProcessedIndex();
      if (lastProcessedIndex >= JobQueue.getJobQueueLength()) {
         lastProcessedIndex = 0;
         JobQueue.setLastProcessedIndex(0);
      }

      const job = JobQueue.getJob(lastProcessedIndex);
      const curTick = system.currentTick;

      if (!pcheck(job.player) || curTick - job.startTick > CFG.jobTimeoutTicks) {
         finalizeAndCleanupState(job);
         JobQueue.popJob(lastProcessedIndex);
         continue;
      }

      const item = getPlayerPickaxe(job.player);
      if (!item) {
         finalizeAndCleanupState(job);
         JobQueue.popJob(lastProcessedIndex);
         continue;
      }

      let broken = 0;
      let tickBlocksBroken = 0;
      let blockBudgetChecked = 0;
      while (broken < blocksPerTick && job.index < job.locations.length) {
         if (++blockBudgetChecked % 4 === 0 && Date.now() - startTime > 5) break;
         const loc = job.locations[job.index++];
         const block = getBlockSafe(job.dimension, loc);

         if (block && block.typeId === job.targetId) {
            const dropAmt = job.fortuneLevel > 0 ? Math.floor(Math.random() * job.fortuneLevel) + 2 : 1;
            const xpChoices = ORE_XP[job.targetId] || [0];
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

      // Apply durability damage dynamically per tick based on actual blocks broken
      if (tickBlocksBroken > 0) {
         Durability.applyDurabilityDamage(job.player, item, tickBlocksBroken, job.unbreakingLevel);
      }

      if (job.index >= job.locations.length) {
         finalizeAndCleanupState(job);
         JobQueue.popJob(lastProcessedIndex);
      } else {
         JobQueue.incrementLastProcessedIndex();
      }

      jobsDone++;
   }
};
