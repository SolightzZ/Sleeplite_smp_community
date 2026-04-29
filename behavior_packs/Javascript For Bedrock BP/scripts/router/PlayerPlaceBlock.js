import { world } from "@minecraft/server";
import { handleBlockEditPreEvent } from "../module/protection/system";

const handlers = [handleBlockEditPreEvent];

function playerPlaceBlock(event) {
  for (let i = 0; i < handlers.length; i++) {
    handlers[i](event);
    if (event.cancel) return;
  }
}

world.beforeEvents.playerPlaceBlock.subscribe(playerPlaceBlock);
