import { system } from "@minecraft/server";
import { itile_main } from "./plugins/title";

const SPAWN_ACTIONS = {
  "minecraft:ender_dragon": [itile_main],
  "minecraft:wither": [itile_main],
};

export function onEntitySpawn(event) {
  const entity = event.entity;
  if (!entity) return;
  const actions = SPAWN_ACTIONS[entity.typeId];
  if (!actions) return;

  system.run(() => {
    for (const action of actions) {
      if (typeof action === "function") {
        action(event);
      }
    }
  });
}
