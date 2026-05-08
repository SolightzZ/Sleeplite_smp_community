import { ItemStack } from "@minecraft/server";
import { applyDurabilityDamage } from "../utils/durability";
import { getPlayerPickaxe } from "../utils/player";
import { state } from "./queue";

export const finalizeJobDrops = (dimension, location, dropTypeId, amount, xpTotal) => {
  if (dropTypeId && amount > 0) {
    let remaining = amount;
    while (remaining > 0) {
      const stackSize = Math.min(remaining, 64);
      dimension.spawnItem(new ItemStack(dropTypeId, stackSize), location);
      remaining -= stackSize;
    }
  }

  if (xpTotal > 0) {
    let remainingXp = xpTotal;
    while (remainingXp > 0) {
      dimension.spawnEntity("minecraft:xp_orb", location);
      remainingXp -= 5;
    }
  }
};

export const finalizeAndCleanupState = (job) => {
  if (job.brokenCount > 0 || job.xpAccumulated > 0) {
    finalizeJobDrops(job.player.dimension, job.player.location, job.dropTypeId, job.brokenCount, job.xpAccumulated);

    const blocksActuallyBroken = job.index;
    const item = getPlayerPickaxe(job.player);
    if (item) {
      applyDurabilityDamage(job.player, item, blocksActuallyBroken, job.unbreakingLevel);
    }
  }

  for (let i = 0; i < job.visitedKeys.length; i++) {
    state.pendingBlocks.delete(job.visitedKeys[i]);
  }

  const count = state.playerJobCount.get(job.playerId) ?? 1;
  if (count <= 1) {
    state.playerJobCount.delete(job.playerId);
  } else {
    state.playerJobCount.set(job.playerId, count - 1);
  }

  state.playerLastJobEnd.set(job.playerId, Date.now());
};
