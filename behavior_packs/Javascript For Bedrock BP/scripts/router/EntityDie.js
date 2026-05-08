import { world } from "@minecraft/server";
import { DathCounter } from "../module/dropheads/event.js";
import { onDeadFullBright } from "../module/fullBright/events.js";
import { gravestone_main } from "../module/graveStones/index.js";
import { magnetDie } from "../module/magNet/index.js";


const PLAYER_ACTIONS = [
  gravestone_main,
  DathCounter,
  magnetDie,
  onDeadFullBright,
];

world.afterEvents.entityDie.subscribe((event) => {
  try {
    const entity = event.deadEntity;
    if (!entity || entity.typeId !== "minecraft:player") return;

    for (let i = 0; i < PLAYER_ACTIONS.length; i++) {
      PLAYER_ACTIONS[i](event);
    }
  } catch (error) {
    console.warn("entity_die", error.message);
  }
});
