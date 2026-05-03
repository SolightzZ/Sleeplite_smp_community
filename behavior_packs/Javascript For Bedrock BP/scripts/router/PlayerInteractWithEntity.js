import { world } from "@minecraft/server";
import { onGravestoneInteract } from "../module/graveStones/gravestones_entity";
import { handleEntityInteractPreEvent } from "../module/protection/system";

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
