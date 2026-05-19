import { Player, world } from "@minecraft/server";
import { startEmote } from "../module/emotes/system.js";
import { FullBrightUseItem } from "../module/fullBright/events.js";
import { onJobItemUse } from "../module/jobs/Job.js";
import { onMagnetUse } from "../module/magNet/index.js";
import { onItemUse } from "../module/protection/index.js";
import { RewarditemUse } from "../module/rewards/system.js";
import { chatRankItemUse } from "../module/nameteg/index.js";
import { RUNREPORT } from "../module/report/index.js";
import { setting_main } from "../plugin/setting.js";
import { handleSpongeAbsorption } from "../plugin/SpongeAbsorption.js";

const itemHandlers = new Map([
  ["minecraft:compass", setting_main],
  ["addon:protection", onItemUse],
  ["addon:trade", RewarditemUse],
  ["addon:emote", startEmote],
  ["minecraft:paper", RUNREPORT],
  ["minecraft:command_block", chatRankItemUse],
  ["addon:magnet_", onMagnetUse],
  ["addon:fullbright_", FullBrightUseItem],
  ["addon:job", onJobItemUse],
  ["minecraft:sponge", handleSpongeAbsorption],
]);

world.afterEvents.itemUse.subscribe((ev) => {
  try {
    const player = ev.source;
    const stack = ev.itemStack;
    if (!(player instanceof Player) || !player.isValid || !stack) return;

    const handler = itemHandlers.get(stack.typeId);
    if (handler) handler(ev);
  } catch (e) {
    console.warn("[ ItemUse ] item_use", e.message);
  }
});
