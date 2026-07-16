import { system } from '@minecraft/server';
import { CFG } from '../config.js';
import { JobQueue } from './state.js';
import { LOG_TO_LEAF } from '../data/trees.js';
import { getPlayerAxe } from '../utils/inventory.js';
import { getBlockSafe } from '../../../shared/block.js';
import { detectTree } from './detector.js';
import { pcheck } from './../../../shared/player.js';

const _aboveLoc = { x: 0, y: 0, z: 0 };

export const TreeCapitatorBreakBlock = (event) => {
   const player = event.player;
   const block = event.block;
   const perm = event.brokenBlockPermutation;

   if (!pcheck(player)) return;
   if (!block || !block.isValid || !perm) return;
   if (!player.isSneaking) return;
   if (JobQueue.getJobQueueLength() >= CFG.maxGlobalJobs) return;

   const pCount = JobQueue.getPlayerJobCount(player.id);
   if (pCount >= CFG.maxJobsPerPlayer) return;

   const lastEnd = JobQueue.getPlayerLastJobEnd(player.id);
   if (Date.now() - lastEnd < CFG.playerCooldownMs) return;

   const axe = getPlayerAxe(player);
   if (!axe) return;

   const logId = perm.type.id;
   const leafId = LOG_TO_LEAF.get(logId);
   if (!leafId) return;

   const dim = player.dimension;
   const loc = block.location;
   const treeKey = `tree:${dim.id}:${loc.x},${loc.y},${loc.z}`;

   if (JobQueue.isPending(treeKey)) return;

   _aboveLoc.x = loc.x;
   _aboveLoc.y = loc.y + 1;
   _aboveLoc.z = loc.z;
   const above = getBlockSafe(dim, _aboveLoc);
   if (!above || above.typeId !== logId) return;

   const res = detectTree(above, logId, leafId);
   if (!res.foundLeaf || res.locations.length === 0) return;

   JobQueue.addPending(treeKey);
   JobQueue.incrementPlayerJobCount(player.id);

   JobQueue.pushJob({
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
