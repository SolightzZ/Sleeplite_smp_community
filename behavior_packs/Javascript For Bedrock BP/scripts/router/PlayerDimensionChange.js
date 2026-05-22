import { world } from "@minecraft/server";
import { handlePlayerDimensionChange } from "../module/biometype/system.js";

world.afterEvents.playerDimensionChange.subscribe((ev) => {
  try {
    const player = ev.player;
    if (!player || !player.isValid) return;
    handlePlayerDimensionChange(ev);
  } catch (e) {
    console.warn("[ PlayerDimensionChange ] player_dimension_change", e.message);
  }
});
