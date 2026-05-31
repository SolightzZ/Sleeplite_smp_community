import { world } from "@minecraft/server";
import { handlePlayerDimensionChange } from "../module/biometype/system.js";
import { runEventHandlers } from "./utils.js";

world.afterEvents.playerDimensionChange.subscribe((ev) => {
  const player = ev.player;
  if (!player || !player.isValid) return;
  runEventHandlers("PlayerDimensionChange", [handlePlayerDimensionChange], ev);
});
