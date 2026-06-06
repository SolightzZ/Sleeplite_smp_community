import { ItemStack } from "@minecraft/server";
import { applyDurabilityDamage } from "../utils/durability.js";
import { getPlayerPickaxe } from "../utils/player.js";
import { state } from "./queue.js";

export const finalizeJobDrops = (job) => {
  const dim = job.player.dimension;
  const loc = job.player.location;
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
    job.player.playSound("random.orb", { pitch: 1.0, volume: 0.5 });
  }
};

export const finalizeAndCleanupState = (job) => {
  if (job.brokenCount > 0 || job.xpAccumulated > 0) {
    finalizeJobDrops(job);

    const blocksBroken = job.brokenCount;
    const item = getPlayerPickaxe(job.player);
    if (item) {
      applyDurabilityDamage(job.player, item, blocksBroken, job.unbreakingLevel);
    }
  }

  for (const key of job.visitedKeys) {
    state.pendingBlocks.delete(key);
  }

  const count = state.playerJobCount.get(job.playerId) || 1;
  if (count <= 1) {
    state.playerJobCount.delete(job.playerId);
  } else {
    state.playerJobCount.set(job.playerId, count - 1);
  }

  state.playerLastJobEnd.set(job.playerId, Date.now());
};
