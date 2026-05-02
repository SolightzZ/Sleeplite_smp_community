import { world } from "@minecraft/server";
import { DathCounter } from "../module/dropheads/event.js";
import { onDeadFullBright } from "../module/fullBright/events.js";
import { gravestone_main } from "../module/graveStones/gravestones.js";
import { magnetDie } from "../module/magNet/events.js";
const PLAYER_ACTIONS = [
  gravestone_main,
  DathCounter,
  magnetDie,
  onDeadFullBright,
];

function onEntityDeath(event) {
  const entity = event.deadEntity;
  if (!entity || entity.typeId !== "minecraft:player") return;

  for (let i = 0; i < PLAYER_ACTIONS.length; i++) {
    PLAYER_ACTIONS[i](event);
  }
}

world.afterEvents.entityDie.subscribe(onEntityDeath);
