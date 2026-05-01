import { system, world } from "@minecraft/server";
import { itile_main } from "../plugin/title";

const SPAWN_ACTIONS = {
  "minecraft:ender_dragon": [itile_main],
  "minecraft:wither": [itile_main],
};

function onEntitySpawn(event) {
  const entity = event.entity;
  if (!entity) return;

  const actions = SPAWN_ACTIONS[entity.typeId];
  if (!actions || actions.length === 0) return;

  system.run(() => {
    for (let i = 0; i < actions.length; i++) {
      const fn = actions[i];
      if (fn) fn(event);
    }
  });
}

world.afterEvents.entitySpawn.subscribe(onEntitySpawn);
