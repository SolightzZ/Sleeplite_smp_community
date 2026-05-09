import { Player, world } from "@minecraft/server";

import { startEmote } from "../module/emotes/system.js";
import { FullBrightUseItem } from "../module/fullBright/events.js";
import { handleJob } from "../module/jobs/Job.js";
import { LligitemUse } from "../module/light/main.js";
import { MagnetonUseItem } from "../module/magNet/index.js";
import { ZoneProtection_OnItemUse } from "../module/protection/index.js";
import { RewarditemUse } from "../module/rewards/system.js";
import { chatRankItemUse } from "../module/nameteg/index.js";
import { RUNREPORT } from "../module/report/index.js";
import { setting_main } from "../plugin/setting.js";

world.afterEvents.itemUse.subscribe((event) => {
  try {
    const { source, itemStack } = event;
    if (!(source instanceof Player) || !itemStack) return;

    const Items = itemStack.typeId;

    if (Items === "minecraft:light_block_13") {
      return LligitemUse(event);
    } else if (Items === "minecraft:compass") {
      return setting_main(event);
    } else if (Items === "addon:protection") {
      return ZoneProtection_OnItemUse(event);
    } else if (Items === "addon:trade") {
      return RewarditemUse(event);
    } else if (Items === "addon:emote") {
      return startEmote(event);
    } else if (Items === "minecraft:paper") {
      return RUNREPORT(event);
    } else if (Items === "minecraft:command_block") {
      return chatRankItemUse(event);
    } else if (Items === "addon:magnet_") {
      return MagnetonUseItem(event);
    } else if (Items === "addon:fullbright_") {
      return FullBrightUseItem(event);
    } else if (Items === "minecraft:sponge") {
      return handleSpongeAbsorption(event);
    } else if (Items === "addon:bank") {
      handleJob(event);
    }
  } catch (error) {
    console.warn("item_use", error.message);
  }
});
