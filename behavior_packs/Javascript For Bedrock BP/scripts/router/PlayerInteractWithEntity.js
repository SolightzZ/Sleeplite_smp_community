import { world } from "@minecraft/server";
import { onGravestoneInteract } from "../module/graveStones/index.js";
import { onEntityInteract } from "../module/protection/index.js";

const handlers = [onGravestoneInteract, onEntityInteract];

world.beforeEvents.playerInteractWithEntity.subscribe((ev) => {
  try {
    const player = ev.player;
    const target = ev.target;
    if (!player || !player.isValid || !target) return;

    const len = handlers.length;
    for (let i = 0; i < len; i++) {
      handlers[i](ev);
      if (ev.cancel) return;
    }
  } catch (e) {
    console.warn(
      "[ PlayerInteractWithEntity ] player_interact_entity",
      e.message,
    );
  }
});
