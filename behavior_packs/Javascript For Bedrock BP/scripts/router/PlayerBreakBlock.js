import { world } from "@minecraft/server";
import { onCropBreak } from "../module/crops/event";
import { onHammerBreak } from "../module/hammer";
import { handleBlockEditPreEvent } from "../module/protection/system";

const handlers = [onCropBreak, onHammerBreak, handleBlockEditPreEvent];

function playerBreakRouter(event) {
  if (!event.player || !event.block) return;

  for (let i = 0; i < handlers.length; i++) {
    handlers[i](event);
    if (event.cancel) return;
  }
}

world.beforeEvents.playerBreakBlock.subscribe(playerBreakRouter);
