import { system } from "@minecraft/server";
import { state, popJob } from "./queue";
import { CFG } from "../config";
import { getBlockSafe, getAirPerm } from "../utils/block";
import { getPlayerPickaxe } from "../utils/player";
import { finalizeAndCleanupState } from "./lifecycle";
import { ORE_XP } from "../data/ores";

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

  let jobsProcessedThisTick = 0;
  const maxJobsThisTick = Math.min(totalJobs, 4);

  while (jobsProcessedThisTick < maxJobsThisTick && state.jobQueue.length > 0) {
    if (state.lastProcessedIndex >= state.jobQueue.length) state.lastProcessedIndex = 0;

    const job = state.jobQueue[state.lastProcessedIndex];
    const currentTick = system.currentTick;

    if (!job.player.isValid || (currentTick - job.startTick) > CFG.jobTimeoutTicks) {
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

    let brokenThisTick = 0;
    while (brokenThisTick < blocksPerTick && job.index < job.locations.length) {
      const loc = job.locations[job.index++];
      const block = getBlockSafe(job.player.dimension, loc);

      if (block && block.typeId === job.targetId) {
        const dropAmount = (job.fortuneLevel > 0) ? (Math.floor(Math.random() * job.fortuneLevel) + 2) : 1;
        const xpChoices = ORE_XP[job.targetId] || [0];
        const xpAmount = xpChoices[Math.floor(Math.random() * xpChoices.length)];

        try {
          block.setPermutation(getAirPerm());
          job.brokenCount += dropAmount;
          job.xpAccumulated += xpAmount;
          brokenThisTick++;
        } catch { }
      }
    }

    if (job.index >= job.locations.length) {
      finalizeAndCleanupState(job);
      popJob(state.lastProcessedIndex);
    } else {
      state.lastProcessedIndex++;
    }

    jobsProcessedThisTick++;
  }
};
