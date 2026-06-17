import { system } from "@minecraft/server";
import { CFG } from "../config.js";
import {
  getJobQueueLength,
  getPlayerJobCount,
  getPlayerLastJobEnd,
  isTreePending,
  addPendingTree,
  incrementPlayerJobCount,
  pushJob,
  cleanupPlayerState
} from "./state.js";
import { LOG_TO_LEAF } from "../data/trees.js";
import { getPlayerAxe } from "../utils/inventory.js";
import { getBlockSafe } from "../utils/block.js";
import { detectTree } from "./detector.js";

export const TreeCapitatorBreakBlock = (event) => {
  const player = event.player;
  const block = event.block;
  const perm = event.brokenBlockPermutation;

  if (!player || !player.isValid) return;
  if (!block || !block.isValid || !perm) return;
  if (!player.isSneaking) return;
  if (getJobQueueLength() >= CFG.maxGlobalJobs) return;

  const pCount = getPlayerJobCount(player.id);
  if (pCount >= CFG.maxJobsPerPlayer) return;

  const lastEnd = getPlayerLastJobEnd(player.id);
  if (Date.now() - lastEnd < CFG.playerCooldownMs) return;

  const axe = getPlayerAxe(player);
  if (!axe) return;

  const logId = perm.type.id;
  const leafId = LOG_TO_LEAF.get(logId);
  if (!leafId) return;

  const dim = player.dimension;
  const loc = block.location;
  const treeKey = `${dim.id}:${loc.x},${loc.y},${loc.z}`;

  if (isTreePending(treeKey)) return;

  const above = getBlockSafe(dim, { x: loc.x, y: loc.y + 1, z: loc.z });
  if (!above || above.typeId !== logId) return;

  const res = detectTree(above, logId, leafId);
  if (!res.foundLeaf || res.locations.length === 0) return;

  addPendingTree(treeKey);
  incrementPlayerJobCount(player.id);

  pushJob({
    player: player,
    dimension: dim,
    typeId: logId,
    locations: res.locations,
    index: 0,
    startTick: system.currentTick,
    treeKey: treeKey,
    playerId: player.id,
    brokenCount: 0,
  });
};


