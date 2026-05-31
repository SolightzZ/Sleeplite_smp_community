import { system } from "@minecraft/server";
import { CFG } from "../config.js";
import { state } from "./state.js";
import { LOG_TO_LEAF } from "../data/trees.js";
import { getPlayerAxe } from "../utils/inventory.js";
import { getBlockSafe } from "../utils/block.js";
import { detectTree } from "./detector.js";
import { processJobs } from "./processor.js";

export const TreeCapitatorBreakBlock = (ev) => {
  const player = ev.player;
  const block = ev.block;
  const perm = ev.brokenBlockPermutation;

  if (!player || !player.isValid) return;
  if (!player.isSneaking) return;
  if (state.jobQueue.length >= CFG.maxGlobalJobs) return;

  const pCount = state.playerJobCount.get(player.id) || 0;
  if (pCount >= CFG.maxJobsPerPlayer) return;

  const lastEnd = state.playerLastJobEnd.get(player.id) || 0;
  if (Date.now() - lastEnd < CFG.playerCooldownMs) return;

  const axe = getPlayerAxe(player);
  if (!axe) return;

  const logId = perm.type.id;
  const leafId = LOG_TO_LEAF.get(logId);
  if (!leafId) return;

  const dim = player.dimension;
  const loc = block.location;
  const treeKey = `${dim.id}:${loc.x},${loc.y},${loc.z}`;

  if (state.pendingTrees.has(treeKey)) return;

  const above = getBlockSafe(dim, { x: loc.x, y: loc.y + 1, z: loc.z });
  if (!above || above.typeId !== logId) return;

  const res = detectTree(above, logId, leafId);
  if (!res.foundLeaf || res.locations.length === 0) return;

  state.pendingTrees.add(treeKey);
  state.playerJobCount.set(player.id, pCount + 1);

  state.jobQueue.push({
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

  if (state.runHandle === null) {
    state.runHandle = system.runInterval(processJobs, 1);
  }
};
