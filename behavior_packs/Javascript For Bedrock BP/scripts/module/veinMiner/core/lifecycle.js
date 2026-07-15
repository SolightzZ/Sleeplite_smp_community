import { ItemStack } from '@minecraft/server';
import { JobQueue } from "../../../shared/jobQueue.js";
import { cache } from '../../../shared/cache.js';
import { pcheck } from './../../../shared/player.js';

const finalizeJobDrops = (job) => {
   const dim = job.dimension;
   const loc = pcheck(job.player) ? job.player.location : job.locations[0];
   if (!loc) return;
   const dropId = job.dropTypeId;
   const amt = job.brokenCount;
   const xpTotal = job.xpAccumulated;

   if (dropId && amt > 0) {
      let remaining = amt;

      while (remaining > 0) {
         const stack = Math.min(remaining, 64);
         dim.spawnItem(cache.createItemStack(dropId, stack), loc);
         remaining -= stack;
      }
   }

   if (xpTotal > 0 && pcheck(job.player)) {
      job.player.addExperience(xpTotal);
      job.player.playSound('random.orb', { pitch: 1.0, volume: 0.5 });
   }
};

export const finalizeAndCleanupState = (job) => {
   if (job.brokenCount > 0 || job.xpAccumulated > 0) {
      finalizeJobDrops(job);
   }

   for (const key of job.locationKeys) {
      JobQueue.removePending(key);
   }

   JobQueue.decrementPlayerJobCount(job.playerId);
   JobQueue.setPlayerLastJobEnd(job.playerId, Date.now());
};

