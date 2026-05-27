import { world } from "@minecraft/server";
import { itile_main } from "../plugin/title.js";

const spawnHandlers = new Map([
  ["minecraft:ender_dragon", [itile_main]],
  ["minecraft:wither", [itile_main]],
]);

world.afterEvents.entitySpawn.subscribe((ev) => {
  try {
    const entity = ev.entity;
    if (!entity || !entity.isValid) return;

    const handlers = spawnHandlers.get(entity.typeId);
    if (!handlers || handlers.length === 0) return;

    const len = handlers.length;
    for (let i = 0; i < len; i++) {
      const fn = handlers[i];
      if (fn) fn(ev);
    }
  } catch (e) {
    console.warn("[ EntitySpawn ] entity_spawn", e.message);
  }
});
