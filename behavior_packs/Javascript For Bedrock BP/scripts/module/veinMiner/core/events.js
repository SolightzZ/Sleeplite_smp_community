import { system } from "@minecraft/server";
import { CFG } from "../config.js";
import { JobQueue } from "../../../shared/jobQueue.js";
import { getLocKey } from "../../../shared/block.js";
import { PICKAXE_BREAKS, ORE_DROP } from "../data/ores.js";
import { scanVein } from "./scanner.js";
import { getEnchantData } from "../../../shared/enchant.js";
import { pcheck } from './../../../shared/player.js';

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
  const validOres = PICKAXE_BREAKS[stack?.typeId];
  if (!validOres || !validOres.has(targetId)) return;

  const loc = block.location;
  const startKey = getLocKey(loc.x, loc.y, loc.z);
  if (JobQueue.isPending(startKey)) return;

  const res = scanVein(block, targetId);
  if (res.locations.length <= 1) return;

  const locationKeys = res.locations.map(l => getLocKey(l.x, l.y, l.z));
  for (const key of locationKeys) {
    JobQueue.addPending(key);
  }

  const enc = getEnchantData(stack);
  const dropId = enc.silk ? targetId : ORE_DROP[targetId];

  JobQueue.incrementPlayerJobCount(player.id);

  const dim = player.dimension;

  JobQueue.pushJob({
    player: player,
    playerId: player.id,
    dimension: dim,
    targetId: targetId,
    dropTypeId: dropId,
    locations: res.locations,
    index: 1,
    startTick: system.currentTick,
    fortuneLevel: enc.fortune,
    unbreakingLevel: enc.unbreaking,
    brokenCount: 0,
    xpAccumulated: 0,
    locationKeys: locationKeys,
  });
};

