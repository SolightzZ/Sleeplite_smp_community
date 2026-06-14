import { system, BlockPermutation } from "@minecraft/server";
import { state, popJob } from "./queue.js";
import { CFG } from "../config.js";
import { getBlockSafe } from "../utils/block.js";
import { getPlayerPickaxe } from "../utils/player.js";
import { finalizeAndCleanupState } from "./lifecycle.js";
import { ORE_XP } from "../data/ores.js";

export const processVeinJobs = () => {
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
      finalizeAndCleanupState(job);
      popJob(state.lastProcessedIndex);
      continue;
    }

    const item = getPlayerPickaxe(job.player);
    if (!item) {
      finalizeAndCleanupState(job);
      popJob(state.lastProcessedIndex);
      continue;
    }

    let broken = 0;
    while (broken < blocksPerTick && job.index < job.locations.length) {
      const loc = job.locations[job.index++];
      const block = getBlockSafe(job.dimension, loc);

      if (block && block.typeId === job.targetId) {
        const dropAmt = job.fortuneLevel > 0 ? Math.floor(Math.random() * job.fortuneLevel) + 2 : 1;
        const xpChoices = ORE_XP[job.targetId] || [0];
        const xpAmt = xpChoices[Math.floor(Math.random() * xpChoices.length)];

        try {
          block.setPermutation(BlockPermutation.resolve("minecraft:air"));
          job.brokenCount += dropAmt;
          job.xpAccumulated += xpAmt;
          broken++;
        } catch (error) {
          console.error("[VeinMiner] Error breaking block:" + error);
        }
      }
    }

    if (job.index >= job.locations.length) {
      finalizeAndCleanupState(job);
      popJob(state.lastProcessedIndex);
    } else {
      state.lastProcessedIndex++;
    }

    jobsDone++;
  }
};
