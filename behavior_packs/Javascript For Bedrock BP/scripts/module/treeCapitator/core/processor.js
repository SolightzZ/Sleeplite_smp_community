import { system, BlockPermutation } from "@minecraft/server";
import { CFG } from "../config.js";
import { state, popJob } from "./state.js";
import { cleanupJobState } from "./lifecycle.js";
import { getPlayerAxe } from "../utils/inventory.js";
import { spawnBatchedDrops } from "../utils/drops.js";
import { getBlockSafe } from "../utils/block.js";
import { applyDurabilityDamage } from "../utils/durability.js";

export const processJobs = () => {
  if (state.jobQueue.length === 0) {
    if (state.runHandle !== null) {
      system.clearRun(state.runHandle);
      state.runHandle = null;
    }
    return;
  }

  const totalJobs = state.jobQueue.length;
  const loadFactor = Math.max(1, Math.floor(totalJobs / 4));
  const blocksPerTick = Math.max(1, Math.ceil(CFG.blocksPerTickBase / loadFactor));

  let jobsDone = 0;
  const maxJobs = Math.min(totalJobs, 4);

  while (jobsDone < maxJobs && state.jobQueue.length > 0) {
    if (state.lastProcessedIndex >= state.jobQueue.length) {
      state.lastProcessedIndex = 0;
    }

    const job = state.jobQueue[state.lastProcessedIndex];
    const curTick = system.currentTick;

    if (!job.player.isValid || curTick - job.startTick > CFG.jobTimeoutTicks) {
      cleanupJobState(job);
      popJob(state.lastProcessedIndex);
      continue;
    }

    const axe = getPlayerAxe(job.player);
    if (!axe) {
      spawnBatchedDrops(job.dimension, job.player.location, job.typeId, job.brokenCount);
      cleanupJobState(job);
      popJob(state.lastProcessedIndex);
      continue;
    }

    let broken = 0;
    while (broken < blocksPerTick && job.index < job.locations.length) {
      const loc = job.locations[job.index++];
      const block = getBlockSafe(job.dimension, loc);

      if (block && block.typeId === job.typeId) {
        try {
          block.setPermutation(BlockPermutation.resolve("minecraft:air"));
          job.brokenCount++;
          broken++;
        } catch (error) {
          console.error("[ treeCapitator ] breakError", error.message);
        }
      }
    }

    if (job.index >= job.locations.length) {
      spawnBatchedDrops(job.dimension, job.player.location, job.typeId, job.brokenCount);
      applyDurabilityDamage(job.player, job.brokenCount);
      cleanupJobState(job);
      popJob(state.lastProcessedIndex);
    } else {
      state.lastProcessedIndex++;
    }

    jobsDone++;
  }
};
