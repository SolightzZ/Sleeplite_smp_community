import { world } from "@minecraft/server";
import { onBlockEdit } from "../module/protection/core/events.js";
import { runEventHandlersWithCancel } from "./utils.js";

const handlers = [onBlockEdit];

world.beforeEvents.playerPlaceBlock.subscribe((ev) => {
  const player = ev.player;
  const block = ev.block;
  if (!player || !player.isValid || !block) return;
  runEventHandlersWithCancel("PlayerPlaceBlock", handlers, ev);
});
