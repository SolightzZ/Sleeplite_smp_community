import { Player } from "@minecraft/server";

import { startEmote } from "./Emote/system.js";
import { FullBrightUseItem } from "./FullBright/events.js";
import { MagnetonUseItem } from "./magnet/events.js";
import { RewarditemUse } from "./Reward/system.js";
import { setting_main } from "./plugins/setting.js";
import { bankingSystem } from "./economy/system.js";
import { ZoneProtection_OnItemUse } from "./Protection/system.js";
import { LligitemUse } from "./light/main.js";
import { RUNREPORT } from "./plugins/Report.js";
import { chatrankssitemUse } from "./plugins/NameTagRank.js";

const EXACT_ACTIONS = {
  "minecraft:light_block_13": LligitemUse,
  "minecraft:compass": setting_main,
  "addon:protection": ZoneProtection_OnItemUse,
  "addon:trade": RewarditemUse,
  "addon:bank": bankingSystem,
  "addon:emote": startEmote,
  "minecraft:paper": RUNREPORT,
  "minecraft:command_block": chatrankssitemUse,
  "addon:magnet_": MagnetonUseItem,
  "addon:fullbright_": FullBrightUseItem,
};

export function onItemUse(e) {
  const { source, itemStack } = e;
  if (!(source instanceof Player) || !itemStack) return;
  const id = itemStack.typeId;
  const exact = EXACT_ACTIONS[id];
  if (exact) {
    exact(e);
    return;
  }
}
