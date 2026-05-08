import { world } from "@minecraft/server";

import { handleEntityInteractPreEvent } from "../module/protection/index";
import { onGravestoneInteract } from "../module/graveStones/index";

const handlers = [onGravestoneInteract, handleEntityInteractPreEvent];

world.beforeEvents.playerInteractWithEntity.subscribe((event) => {
  try {
    for (let i = 0; i < handlers.length; i++) {
      handlers[i](event);
      if (event.cancel) return;
    }
  } catch (error) {
    console.warn("player_interact_with_entity", error.message);
  }
});
