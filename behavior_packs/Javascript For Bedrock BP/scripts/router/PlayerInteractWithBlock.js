import { world } from "@minecraft/server";
import { touch } from "../module/endPortalFrame/play";
import { handleBlockEditPreEvent } from "../module/protection/system";

const handlers = [touch, handleBlockEditPreEvent];

function playerInteractWithBlock(event) {
  for (let i = 0; i < handlers.length; i++) {
    handlers[i](event);
    if (event.cancel) return;
  }
}

world.beforeEvents.playerInteractWithBlock.subscribe(playerInteractWithBlock);
