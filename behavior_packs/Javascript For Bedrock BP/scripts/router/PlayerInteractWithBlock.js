import { world } from "@minecraft/server";
import { touch } from "../module/endPortalFrame/play.js";
import { onBlockEdit } from "../module/protection/index.js";
import { handleRepairAnvil } from "../plugin/AnvilRepair.js";
import { openDoor } from "../plugin/OpenDoor.js";

const beforeHandlers = [touch, onBlockEdit, handleRepairAnvil];

const afterHandlers = [openDoor];

const runHandlers = (handlers, ev, name) => {
  try {
    const player = ev.player;

    if (!player?.isValid) return;

    for (let i = 0; i < handlers.length; i++) {
      const handler = handlers[i];
      if (typeof handler !== "function") {
        console.error(`[ Router ] ${name}: handler ${i} is not a function`);
        continue;
      }
      handler(ev);
      if (ev.cancel) break;
    }
  } catch (e) {
    console.error(`[ Router ] ${name}:`, e);
  }
};

world.beforeEvents.playerInteractWithBlock.subscribe((ev) => {
  runHandlers(beforeHandlers, ev, "BeforeInteract");
});

world.afterEvents.playerInteractWithBlock.subscribe((ev) => {
  runHandlers(afterHandlers, ev, "AfterInteract");
});
