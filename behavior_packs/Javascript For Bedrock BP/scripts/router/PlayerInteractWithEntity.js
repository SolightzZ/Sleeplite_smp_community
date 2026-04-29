import { world } from "@minecraft/server";
import { onGravestoneInteract } from "../module/graveStones/gravestones_entity";
import { handleEntityInteractPreEvent } from "../module/protection/system";

const handlers = [onGravestoneInteract, handleEntityInteractPreEvent];

function onPlayerInteractWithEntity(event) {
  for (let i = 0; i < handlers.length; i++) {
    handlers[i](event);
    if (event.cancel) return;
  }
}

world.beforeEvents.playerInteractWithEntity.subscribe(
  onPlayerInteractWithEntity,
);
