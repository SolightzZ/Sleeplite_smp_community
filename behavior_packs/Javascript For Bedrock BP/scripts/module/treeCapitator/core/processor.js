import { system, BlockPermutation, ItemStack } from "@minecraft/server";
import { CFG } from "../config.js";
import {
  getJobQueueLength,
  getJob,
  popJob,
  getLastProcessedIndex,
  setLastProcessedIndex
} from "./state.js";
import { cleanupJobState } from "./lifecycle.js";
import { getPlayerAxe } from "../utils/inventory.js";
import { applyDurabilityDamage } from "../utils/durability.js";

let _airPermutation;

const TICK_BUDGET_MS = 5;

export const processJobs = () => {
  const AIR = _airPermutation || (_airPermutation = BlockPermutation.resolve("minecraft:air"));
  try {
    const totalJobs = getJobQueueLength();
    if (totalJobs === 0) {
      setLastProcessedIndex(0);
      return;
    }

    const loadFactor = Math.max(1, Math.floor(totalJobs / 4));
    const blocksPerTick = Math.max(1, Math.ceil(CFG.blocksPerTickBase / loadFactor));
    const startTime = Date.now();

    let jobsDone = 0;
    let budgetChecked = 0;
    const maxJobs = Math.min(totalJobs, 4);

    while (jobsDone < maxJobs && getJobQueueLength() > 0) {
      if (++budgetChecked % 4 === 0 && Date.now() - startTime > TICK_BUDGET_MS) break;

      let lastProcessedIndex = getLastProcessedIndex();
      if (lastProcessedIndex >= getJobQueueLength()) {
        lastProcessedIndex = 0;
        setLastProcessedIndex(0);
      }

      const job = getJob(lastProcessedIndex);
      const curTick = system.currentTick;

      if (!job.player.isValid || curTick - job.startTick > CFG.jobTimeoutTicks) {
        cleanupJobState(job);
        popJob(lastProcessedIndex);
        continue;
      }

      const axe = getPlayerAxe(job.player);
      if (!axe) {
        cleanupJobState(job);
        popJob(lastProcessedIndex);
        continue;
      }

      let broken = 0;
      let blockBudgetChecked = 0;
      while (broken < blocksPerTick && job.index < job.locations.length) {
        if (++blockBudgetChecked % 4 === 0 && Date.now() - startTime > TICK_BUDGET_MS) break;

        const loc = job.locations[job.index++];

        try {
          const block = job.dimension.getBlock(loc);
          if (block && block.typeId === job.typeId) {
            block.setPermutation(AIR);
            job.brokenCount++;
            broken++;

            const spawnAt = { x: loc.x + 0.5, y: loc.y + 0.5, z: loc.z + 0.5 };
            job.dimension.spawnItem(new ItemStack(job.typeId, 1), spawnAt);
          }
        } catch (error) {
          console.error("[ treeCapitator ] breakError", error.message);
        }
      }

      // Apply durability damage dynamically per tick
      if (broken > 0) {
        applyDurabilityDamage(job.player, broken);
      }

      if (job.index >= job.locations.length) {
        cleanupJobState(job);
        popJob(lastProcessedIndex);
      } else {
        incrementLastProcessedIndex();
      }

      jobsDone++;
    }
  } catch (e) {
    console.error("[ treeCapitator ] processJobs crash:", e);
  }
};

