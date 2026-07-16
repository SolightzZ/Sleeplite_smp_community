import { BlockPermutation, system } from '@minecraft/server';
import { logError } from '../../../events/logger.js';
import { cache } from '../../../shared/cache.js';
import { Durability } from '../../../shared/durability.js';
import { getEnchantLevel } from '../../../shared/enchant.js';
import { getBlockSafe } from '../../../shared/block.js';
import { CFG } from '../config.js';
import { JobQueue } from './state.js';
import { getPlayerAxe } from '../utils/inventory.js';
import { pcheck } from './../../../shared/player.js';
import { cleanupJobState } from './lifecycle.js';

let _airPermutation;

const TICK_BUDGET_MS = CFG.tickBudgetMs ?? 5;

const _spawnAt = { x: 0, y: 0, z: 0 };

export const processJobs = () => {
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
      const maxJobs = Math.min(totalJobs, 4);

      while (jobsDone < maxJobs && JobQueue.getJobQueueLength() > 0) {
         if (++budgetChecked % 4 === 0 && Date.now() - startTime > TICK_BUDGET_MS) break;

         let lastProcessedIndex = JobQueue.getLastProcessedIndex();
         if (lastProcessedIndex >= JobQueue.getJobQueueLength()) {
            lastProcessedIndex = 0;
            JobQueue.setLastProcessedIndex(0);
         }

         const job = JobQueue.getJob(lastProcessedIndex);
         const curTick = system.currentTick;

         if (!pcheck(job.player) || curTick - job.startTick > CFG.jobTimeoutTicks) {
            cleanupJobState(job);
            JobQueue.popJob(lastProcessedIndex);
            continue;
         }

         const axe = getPlayerAxe(job.player);
         if (!axe) {
            cleanupJobState(job);
            JobQueue.popJob(lastProcessedIndex);
            continue;
         }

         let broken = 0;
         let blockBudgetChecked = 0;
         while (broken < blocksPerTick && job.index < job.locations.length) {
            if (++blockBudgetChecked % 4 === 0 && Date.now() - startTime > TICK_BUDGET_MS) break;

            const loc = job.locations[job.index++];
            if (!loc || typeof loc.x !== 'number') continue;

            try {
               const block = getBlockSafe(job.dimension, loc);
               if (block && block.typeId === job.typeId) {
                  block.setPermutation(AIR);
                  job.brokenCount++;
                  broken++;

                  _spawnAt.x = loc.x + 0.5;
                  _spawnAt.y = loc.y + 0.5;
                  _spawnAt.z = loc.z + 0.5;
                  job.dimension.spawnItem(cache.createItemStack(job.typeId, 1), _spawnAt);
               }
            } catch (error) {
               logError('treeCapitator', 'breakError', error);
            }
         }

         if (broken > 0) {
            const unbreakLevel = getEnchantLevel(axe, 'unbreaking');
            Durability.applyDurabilityDamage(job.player, axe, broken, unbreakLevel);
         }

         if (job.index >= job.locations.length) {
            cleanupJobState(job);
            JobQueue.popJob(lastProcessedIndex);
         } else {
            JobQueue.incrementLastProcessedIndex();
         }

         jobsDone++;
      }
   } catch (e) {
      logError('treeCapitator', 'processJobs crash', e);
   }
};
