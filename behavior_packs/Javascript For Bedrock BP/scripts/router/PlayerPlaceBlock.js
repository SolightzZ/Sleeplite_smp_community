import { world } from "@minecraft/server";
import { onBlockEdit } from "../module/protection/index.js";

const handlers = [onBlockEdit];

world.beforeEvents.playerPlaceBlock.subscribe((ev) => {
  try {
    const player = ev.player;
    const block = ev.block;
    if (!player || !player.isValid || !block) return;

    const len = handlers.length;
    for (let i = 0; i < len; i++) {
      handlers[i](ev);
      if (ev.cancel) return;
    }
  } catch (e) {
    console.warn("[ PlayerPlaceBlock ] player_place_block", String(e));
  }
});
