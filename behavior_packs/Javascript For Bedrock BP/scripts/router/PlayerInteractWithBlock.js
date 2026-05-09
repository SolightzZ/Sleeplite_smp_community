import { world } from "@minecraft/server";
import { touch } from "../module/endPortalFrame/play.js";
import { onBlockEdit } from "../module/protection/index.js";
import { handleRepairAnvil } from "../plugin/AnvilRepair.js";
import { openDoor } from "../plugin/OpenDoor.js";

const beforeHandlers = [touch, onBlockEdit, handleRepairAnvil];
const afterHandlers = [openDoor];

const runHandlers = (handlers, ev) => {
  try {
    const player = ev.player;
    const block = ev.block;
    if (!player || !player.isValid || !block) return false;

    const len = handlers.length;
    for (let i = 0; i < len; i++) {
      const res = handlers[i](ev);
      if (res === false || ev.cancel) return false;
    }
    return true;
  } catch (e) {
    console.warn("interact_block", e.message);
    return false;
  }
};

world.beforeEvents.playerInteractWithBlock.subscribe((ev) =>
  runHandlers(beforeHandlers, ev),
);
world.afterEvents.playerInteractWithBlock.subscribe((ev) =>
  runHandlers(afterHandlers, ev),
);
