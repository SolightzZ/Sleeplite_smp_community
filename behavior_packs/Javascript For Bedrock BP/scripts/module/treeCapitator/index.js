import { system } from "@minecraft/server";
import { CFG } from "./config.js";
import { state } from "./core/state.js";
import { LOG_TO_LEAF } from "./data/trees.js";
import { getPlayerAxe } from "./utils/inventory.js";
import { getBlockSafe } from "./utils/block.js";
import { detectTree } from "./core/detector.js";
import { processJobs } from "./core/processor.js";

/**
 * Tree Capitator - Production SMP Edition
 * Optimized for 20-50 players, high performance, and TPS stability.
 */

function onBlockBreak(event) {
  const { player, block, brokenBlockPermutation } = event;

  if (!player || !player.isValid) return;
  if (!player.isSneaking) return;

  if (state.jobQueue.length >= CFG.maxGlobalJobs) return;

  const pCount = state.playerJobCount.get(player.id) ?? 0;
  if (pCount >= CFG.maxJobsPerPlayer) return;

  const lastEnd = state.playerLastJobEnd.get(player.id) ?? 0;
  if (Date.now() - lastEnd < CFG.playerCooldownMs) return;

  const axe = getPlayerAxe(player);
  if (!axe) return;

  const logTypeId = brokenBlockPermutation.type.id;
  const leafTypeId = LOG_TO_LEAF.get(logTypeId);
  if (!leafTypeId) return;

  const dim = player.dimension;
  const treeKey = `${dim.id}:${block.location.x},${block.location.y},${block.location.z}`;

  if (state.pendingTrees.has(treeKey)) return;

  const above = getBlockSafe(dim, {
    x: block.location.x,
    y: block.location.y + 1,
    z: block.location.z,
  });
  if (!above || above.typeId !== logTypeId) return;

  const { locations, foundLeaf } = detectTree(above, logTypeId, leafTypeId);

  if (!foundLeaf || locations.length === 0) return;

  state.pendingTrees.add(treeKey);
  state.playerJobCount.set(player.id, pCount + 1);

  state.jobQueue.push({
    player,
    dimension: dim,
    typeId: logTypeId,
    locations,
    index: 0,
    startTick: system.currentTick,
    treeKey,
    playerId: player.id,
    brokenCount: 0,
  });

  if (state.runHandle === null) {
    state.runHandle = system.runInterval(processJobs, 1);
  }
}

export { onBlockBreak as TreeCapitatorBreakBlock };
