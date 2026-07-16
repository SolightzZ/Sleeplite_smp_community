import { system } from '@minecraft/server';
import { getDimLocKey } from '../../../shared/block.js';
import { getEnchantData } from '../../../shared/enchant.js';
import { CFG } from '../config.js';
import { ORE_DROP, PICKAXE_BREAKS } from '../data/ores.js';
import { JobQueue } from './queue.js';
import { pcheck } from './../../../shared/player.js';
import { scanVein } from './scanner.js';

export const VeinMiner = (event) => {
   const player = event.player;
   const block = event.block;
   const stack = event.itemStack;

   if (!pcheck(player)) return;
   if (!block || !block.isValid) return;
   if (!player.isSneaking) return;
   if (JobQueue.getJobQueueLength() >= CFG.maxGlobalJobs) return;

   const pCount = JobQueue.getPlayerJobCount(player.id);
   if (pCount >= CFG.maxJobsPerPlayer) return;

   const lastEnd = JobQueue.getPlayerLastJobEnd(player.id);
   if (Date.now() - lastEnd < CFG.playerCooldownMs) return;

   const targetId = block.typeId;
   const pickaxeId = stack?.typeId;
   const validOres = PICKAXE_BREAKS[pickaxeId];
   if (!validOres || !validOres.has(targetId)) return;

   const loc = block.location;
   const dimId = player.dimension.id;
   const startKey = getDimLocKey(dimId, loc.x, loc.y, loc.z);
   if (JobQueue.isPending(startKey)) return;

   const res = scanVein(block, targetId);
   const locations = res.locations;
   const count = locations.length;
   if (count <= 1) return;

   for (let i = 0; i < count; i++) {
      const l = locations[i];
      JobQueue.addPending(getDimLocKey(dimId, l.x, l.y, l.z));
   }

   const enc = getEnchantData(stack);
   const dropId = enc.silk ? targetId : ORE_DROP[targetId];

   JobQueue.incrementPlayerJobCount(player.id);

   JobQueue.pushJob({
      player: player,
      playerId: player.id,
      dimension: player.dimension,
      targetId: targetId,
      dropTypeId: dropId,
      pickaxeTypeId: pickaxeId,
      locations: locations,
      index: 1,
      startTick: system.currentTick,
      fortuneLevel: enc.fortune,
      unbreakingLevel: enc.unbreaking,
      brokenCount: 0,
      xpAccumulated: 0,
   });
};
