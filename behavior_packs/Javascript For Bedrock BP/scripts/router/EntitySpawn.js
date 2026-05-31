import { world } from "@minecraft/server";
import { itile_main } from "../plugin/title.js";
import { runEventHandlers } from "./utils.js";

const spawnHandlers = new Map([
  ["minecraft:ender_dragon", [itile_main]],
  ["minecraft:wither", [itile_main]],
]);

world.afterEvents.entitySpawn.subscribe((ev) => {
  const entity = ev.entity;
  if (!entity || !entity.isValid) return;

  const handlers = spawnHandlers.get(entity.typeId);
  if (!handlers || handlers.length === 0) return;

  runEventHandlers("EntitySpawn", handlers, ev);
});
