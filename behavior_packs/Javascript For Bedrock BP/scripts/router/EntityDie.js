import { world } from "@minecraft/server";
import { DeathCounter } from "../module/dropheads/event.js";
import { onDeadFullBright } from "../module/fullBright/events.js";
import { gravestone_main } from "../module/graveStones/index.js";
import { onMagnetPlayerDie } from "../module/magNet/index.js";
import { zoomEntityDie } from "../module/zoom/index.js";

const handlers = [
  gravestone_main,
  DeathCounter,
  onMagnetPlayerDie,
  onDeadFullBright,
  zoomEntityDie,
];
const PLAYER_TYPE = "minecraft:player";

world.afterEvents.entityDie.subscribe((ev) => {
  try {
    const entity = ev.deadEntity;
    if (!entity || !entity.isValid || entity.typeId !== PLAYER_TYPE) return;

    const len = handlers.length;
    for (let i = 0; i < len; i++) {
      handlers[i](ev);
    }
  } catch (e) {
    console.warn("[ EntityDie ] entity_die", e.message);
  }
});
