import { world } from "@minecraft/server";
import { onGravestoneInteract } from "../module/graveStones/core/interact.js";
import { onEntityInteract } from "../module/protection/core/events.js";
import { runEventHandlersWithCancel } from "./utils.js";

const handlers = [onGravestoneInteract, onEntityInteract];

world.beforeEvents.playerInteractWithEntity.subscribe((ev) => {
  const player = ev.player;
  const target = ev.target;
  if (!player || !player.isValid || !target) return;
  runEventHandlersWithCancel("PlayerInteractWithEntity", handlers, ev);
});
