import { world } from "@minecraft/server";
import { DeathCounter } from "../module/dropheads/event.js";
import { onDeadFullBright } from "../module/fullBright/events.js";
import { gravestone_main } from "../module/graveStones/core/spawner.js";
import { onMagnetPlayerDie } from "../module/magNet/core/events.js";
import { zoomEntityDie } from "../module/zoom/core.js";
import { runEventHandlers } from "./utils.js";

const handlers = [gravestone_main, DeathCounter, onMagnetPlayerDie, onDeadFullBright, zoomEntityDie];
const PLAYER_TYPE = "minecraft:player";

world.afterEvents.entityDie.subscribe((ev) => {
  const entity = ev.deadEntity;
  if (!entity || !entity.isValid || entity.typeId !== PLAYER_TYPE) return;
  runEventHandlers("EntityDie", handlers, ev);
});
