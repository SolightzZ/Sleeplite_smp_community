import { ItemStack } from "@minecraft/server";
import { applyDurabilityDamage } from "../utils/durability.js";
import { getPlayerPickaxe } from "../utils/player.js";
import { state } from "./queue.js";

export const finalizeJobDrops = (dim, loc, dropId, amt, xpTotal) => {
  if (dropId && amt > 0) {
    let remaining = amt;
    while (remaining > 0) {
      const stack = Math.min(remaining, 64);
      dim.spawnItem(new ItemStack(dropId, stack), loc);
      remaining -= stack;
    }
  }

  if (xpTotal > 0) {
    let remainingXp = xpTotal;
    while (remainingXp > 0) {
      dim.spawnEntity("minecraft:xp_orb", loc);
      remainingXp -= 5;
    }
  }
};

export const finalizeAndCleanupState = (job) => {
  if (job.brokenCount > 0 || job.xpAccumulated > 0) {
    finalizeJobDrops(job.player.dimension, job.player.location, job.dropTypeId, job.brokenCount, job.xpAccumulated);

    const blocksBroken = job.index;
    const item = getPlayerPickaxe(job.player);
    if (item) {
      applyDurabilityDamage(job.player, item, blocksBroken, job.unbreakingLevel);
    }
  }

  const keysLen = job.visitedKeys.length;
  for (let i = 0; i < keysLen; i++) {
    state.pendingBlocks.delete(job.visitedKeys[i]);
  }

  const count = state.playerJobCount.get(job.playerId) || 1;
  if (count <= 1) {
    state.playerJobCount.delete(job.playerId);
  } else {
    state.playerJobCount.set(job.playerId, count - 1);
  }

  state.playerLastJobEnd.set(job.playerId, Date.now());
};
