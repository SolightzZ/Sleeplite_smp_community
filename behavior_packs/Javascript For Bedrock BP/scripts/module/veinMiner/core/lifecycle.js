import { ItemStack } from '@minecraft/server';
import {
  removePendingBlock,
  decrementPlayerJobCount,
  setPlayerLastJobEnd
} from "./queue.js";

export const finalizeJobDrops = (job) => {
   const dim = job.dimension;
   const loc = job.player.isValid ? job.player.location : job.locations[0];
   if (!loc) return;
   const dropId = job.dropTypeId;
   const amt = job.brokenCount;
   const xpTotal = job.xpAccumulated;

   if (dropId && amt > 0) {
      let remaining = amt;

      while (remaining > 0) {
         const stack = Math.min(remaining, 64);
         dim.spawnItem(new ItemStack(dropId, stack), loc);
         remaining -= stack;
      }
   }

   if (xpTotal > 0 && job.player.isValid) {
      job.player.addExperience(xpTotal);
      job.player.playSound('random.orb', { pitch: 1.0, volume: 0.5 });
   }
};

export const finalizeAndCleanupState = (job) => {
   if (job.brokenCount > 0 || job.xpAccumulated > 0) {
      finalizeJobDrops(job);
   }

   for (const key of job.locationKeys) {
      removePendingBlock(key);
   }

   decrementPlayerJobCount(job.playerId);
   setPlayerLastJobEnd(job.playerId, Date.now());
};

