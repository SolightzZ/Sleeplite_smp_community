import { world } from "@minecraft/server";
import { touch } from "../module/endPortalFrame/play";
import { handleBlockEditPreEvent } from "../module/protection/system";
import { handleRepairAnvil } from "../plugin/AnvilRepair";
import { openDoor } from "../plugin/OpenDoor";

const beforeHandlers = [touch, handleBlockEditPreEvent, handleRepairAnvil];
const afterHandlers = [openDoor];

function runHandlers(handlers, event) {
  try {
    for (let i = 0; i < handlers.length; i++) {
      const handler = handlers[i];
      const result = handler(event);
      if (result === false || event.cancel) return false;
    }

    return true;
  } catch (e) {
    console.error(`Handler error [${handler.name}]:`, e.message);
  }
}

world.beforeEvents.playerInteractWithBlock.subscribe((event) => {
  runHandlers(beforeHandlers, event);
});

world.afterEvents.playerInteractWithBlock.subscribe((event) => {
  runHandlers(afterHandlers, event);
});
