import { system } from "@minecraft/server";
import { CFG } from "../config";
import { state, popJob } from "./state";
import { cleanupJobState } from "./lifecycle";
import { getPlayerAxe } from "../utils/inventory";
import { spawnBatchedDrops } from "../utils/drops";
import { getBlockSafe, getAirPerm } from "../utils/block";
import { applyDurabilityDamage } from "../utils/durability";

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

  let jobsProcessedThisTick = 0;
  const maxJobsThisTick = Math.min(totalJobs, 4);

  while (jobsProcessedThisTick < maxJobsThisTick && state.jobQueue.length > 0) {
    if (state.lastProcessedIndex >= state.jobQueue.length) state.lastProcessedIndex = 0;

    const job = state.jobQueue[state.lastProcessedIndex];
    const currentTick = system.currentTick;

    if (!job.player.isValid || currentTick - job.startTick > CFG.jobTimeoutTicks) {
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

    let brokenThisTick = 0;
    while (brokenThisTick < blocksPerTick && job.index < job.locations.length) {
      const loc = job.locations[job.index++];
      const block = getBlockSafe(job.dimension, loc);

      if (block && block.typeId === job.typeId) {
        try {
          block.setPermutation(getAirPerm());
          job.brokenCount++;
          brokenThisTick++;
        } catch (error) {
          console.log("brokenThisTick" + error);
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

    jobsProcessedThisTick++;
  }
};
