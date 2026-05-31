import { system } from "@minecraft/server";
import { CFG } from "../config.js";
import { state } from "./queue.js";
import { getLocKey } from "../utils/block.js";
import { PICKAXE_BREAKS, ORE_DROP } from "../data/ores.js";
import { scanVein } from "./scanner.js";
import { getEnchantData } from "../utils/enchant.js";
import { processVeinJobs } from "./processor.js";

export const VeinMiner = (ev) => {
  const player = ev.player;
  const block = ev.block;
  const stack = ev.itemStack;

  if (!player || !player.isValid) return;
  if (!player.isSneaking) return;
  if (state.jobQueue.length >= CFG.maxGlobalJobs) return;

  const pCount = state.playerJobCount.get(player.id) || 0;
  if (pCount >= CFG.maxJobsPerPlayer) return;

  const lastEnd = state.playerLastJobEnd.get(player.id) || 0;
  if (Date.now() - lastEnd < CFG.playerCooldownMs) return;

  const targetId = block.typeId;
  const validOres = PICKAXE_BREAKS[stack?.typeId];
  if (!validOres || !validOres.has(targetId)) return;

  const loc = block.location;
  const startKey = getLocKey(loc.x, loc.y, loc.z);
  if (state.pendingBlocks.has(startKey)) return;

  const res = scanVein(block, targetId);
  if (res.locations.length <= 1) return;

  const keysLen = res.visitedKeys.length;
  for (let i = 0; i < keysLen; i++) {
    state.pendingBlocks.add(res.visitedKeys[i]);
  }

  const enc = getEnchantData(stack);
  const dropId = enc.silk ? targetId : ORE_DROP[targetId];

  state.playerJobCount.set(player.id, pCount + 1);

  state.jobQueue.push({
    player: player,
    playerId: player.id,
    targetId: targetId,
    dropTypeId: dropId,
    locations: res.locations,
    index: 1,
    startTick: system.currentTick,
    fortuneLevel: enc.fortune,
    unbreakingLevel: enc.unbreaking,
    brokenCount: 0,
    xpAccumulated: 0,
    visitedKeys: res.visitedKeys,
  });

  if (state.runHandle === null) {
    state.runHandle = system.runInterval(processVeinJobs, 1);
  }
};
