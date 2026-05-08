import { system } from "@minecraft/server";
import { CFG } from "./config";
import { state } from "./core/queue";
import { getLocKey } from "./utils/block";
import { PICKAXE_BREAKS, ORE_DROP } from "./data/ores";
import { scanVein } from "./core/scanner";
import { getEnchantData } from "./utils/enchant";
import { processVeinJobs } from "./core/processor";

/**
 * Vein Miner - Production SMP Edition
 * Highly optimized for performance, network traffic, and TPS stability.
 */

export function VeinMiner(event) {
  const { player, block, itemStack } = event;

  if (!player?.isSneaking) return;
  if (state.jobQueue.length >= CFG.maxGlobalJobs) return;

  const pCount = state.playerJobCount.get(player.id) ?? 0;
  if (pCount >= CFG.maxJobsPerPlayer) return;

  const lastEnd = state.playerLastJobEnd.get(player.id) ?? 0;
  if (Date.now() - lastEnd < CFG.playerCooldownMs) return;

  const targetId = block.typeId;
  const validOres = PICKAXE_BREAKS[itemStack?.typeId];
  if (!validOres || !validOres.has(targetId)) return;

  const startKey = getLocKey(block.location.x, block.location.y, block.location.z);
  if (state.pendingBlocks.has(startKey)) return;

  const { locations, visitedKeys } = scanVein(block, targetId);
  if (locations.length <= 1) return;

  for (let i = 0; i < visitedKeys.length; i++) {
    state.pendingBlocks.add(visitedKeys[i]);
  }

  const enchants = getEnchantData(itemStack);
  const dropTypeId = enchants.silk ? targetId : ORE_DROP[targetId];

  state.playerJobCount.set(player.id, pCount + 1);

  state.jobQueue.push({
    player,
    playerId: player.id,
    targetId,
    dropTypeId,
    locations,
    index: 1,
    startTick: system.currentTick,
    fortuneLevel: enchants.fortune,
    unbreakingLevel: enchants.unbreaking,
    brokenCount: 0,
    xpAccumulated: 0,
    visitedKeys
  });

  if (state.runHandle === null) {
    state.runHandle = system.runInterval(processVeinJobs, 1);
  }
}
