import { logError } from '../../../events/logger.js';
import { JobQueue } from './queue.js';
import { cache } from '../../../shared/cache.js';
import { pcheck } from './../../../shared/player.js';
import { addSound } from '../../../shared/utils.js';
import { getDimLocKey } from '../../../shared/block.js';

const finalizeJobDrops = (job) => {
   const dim = job.dimension;
   const loc = Array.isArray(job.locations) && job.locations[0] ? job.locations[0] : undefined;
   if (!loc) return;
   const dropId = job.dropTypeId;
   const amt = job.brokenCount;
   const xpTotal = job.xpAccumulated;

   if (dropId && amt > 0) {
      const spawnAt = { x: loc.x + 0.5, y: loc.y + 0.5, z: loc.z + 0.5 };
      let remaining = amt;

      while (remaining > 0) {
         const stack = Math.min(remaining, 64);
         dim.spawnItem(cache.createItemStack(dropId, stack), spawnAt);
         remaining -= stack;
      }
   }

   if (xpTotal > 0 && pcheck(job.player)) {
      job.player.addExperience(xpTotal);
      addSound(job.player, 'random.orb', { pitch: 1.0, volume: 0.5 });
   }
};

export const finalizeAndCleanupState = (job) => {
   if (!job) return;

   if (job.brokenCount > 0 || job.xpAccumulated > 0) {
      finalizeJobDrops(job);
   }

    if (!Array.isArray(job.locations) || job.locations.length === 0) {
        logError('VeinMiner', 'finalizeAndCleanupState: job missing locations', {
            playerId: job.playerId,
            targetId: job.targetId,
        });
    } else {
        const dimId = job.dimension.id;
        for (const l of job.locations) {
            JobQueue.removePending(getDimLocKey(dimId, l.x, l.y, l.z));
        }
    }

   JobQueue.decrementPlayerJobCount(job.playerId);
   JobQueue.setPlayerLastJobEnd(job.playerId, Date.now());
};
