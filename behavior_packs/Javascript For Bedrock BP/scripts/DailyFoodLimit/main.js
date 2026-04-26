import { world, system } from "@minecraft/server";
import { rules } from "./constants.js";
import * as Core from "./core.js";
import * as DayManager from "./day_manager.js";

world.beforeEvents.itemUse.subscribe((event) => {
  const player = event.source;
  const items = event.itemStack;
  const IfPlayer = player.typeId == "minecraft:player";

  if (IfPlayer) {
    Core.tryeat(player, items, event);
  }
});

world.afterEvents.itemCompleteUse.subscribe((event) => {
  const player = event.source;
  const items = event.itemStack;
  const IfPlayer = player.typeId == "minecraft:player";

  if (IfPlayer) {
    Core.ate(player, items);
  }
});

system.runInterval(() => {
  DayManager.checkday();
}, rules.checktime);

console.warn("DailyFoodLimit loaded successfully");
