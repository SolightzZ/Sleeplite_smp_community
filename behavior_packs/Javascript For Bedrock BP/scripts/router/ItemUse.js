import { Player } from "@minecraft/server";

import { LligitemUse } from "../module/light/main.js";
import { setting_main } from "./plugins/setting.js";
import { ZoneProtection_OnItemUse } from "./Protection/system.js";
import { RewarditemUse } from "../module/rewards/system.js";
import { startEmote } from "../module/emotes/system.js";
import { RUNREPORT } from "./plugins/Report.js";
import { chatrankssitemUse } from "./plugins/NameTagRank.js";
import { MagnetonUseItem } from "./module/magNet/events.js";
import { FullBrightUseItem } from "./module/fullBright/events.js";

export function onItemUse(event) {
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
    return chatrankssitemUse(event);
  } else if (Items === "addon:magnet_") {
    return MagnetonUseItem(event);
  } else if (Items === "addon:fullbright_") {
    return FullBrightUseItem(event);
  }
}

world.afterEvents.itemUse.subscribe(onItemUse);
