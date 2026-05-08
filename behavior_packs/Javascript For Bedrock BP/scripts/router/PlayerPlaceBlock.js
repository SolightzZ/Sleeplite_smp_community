import { world } from "@minecraft/server";
import { handleBlockEditPreEvent } from "../module/protection/index";

const handlers = [handleBlockEditPreEvent];

world.beforeEvents.playerPlaceBlock.subscribe((event) => {
  try {
    for (let i = 0; i < handlers.length; i++) {
      handlers[i](event);
      if (event.cancel) return;
    }
  } catch (error) {
    console.warn("player_place_block", error.message);
  }
});
