import { world } from "@minecraft/server";
import { startEmote } from "../module/emotes/system.js";
import { FullBrightUseItem } from "../module/fullBright/events.js";
import { onJobItemUse } from "../module/jobs/Job.js";
import { onMagnetUse } from "../module/magNet/index.js";
import { onItemUse } from "../module/protection/index.js";
import { RewarditemUse } from "../module/rewards/system.js";
import { chatRankItemUse } from "../module/nametag/index.js";
import { RUNREPORT } from "../module/report/index.js";
import { setting_main } from "../plugin/setting.js";
import { handleSpongeAbsorption } from "../plugin/SpongeAbsorption.js";

const itemHandlers = [
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
];

world.afterEvents.itemUse.subscribe((ev) => {
  try {
    const player = ev.source;
    const stack = ev.itemStack;
    if (!player || !player.isValid || !stack) return;

    for (let i = 0; i < itemHandlers.length; i++) {
      const [id, handler] = itemHandlers[i];
      if (stack.typeId.startsWith(id)) {
        handler(ev);
        return;
      }
    }
  } catch (e) {
    console.warn("[ ItemUse ] item_use", e.message);
  }
});
