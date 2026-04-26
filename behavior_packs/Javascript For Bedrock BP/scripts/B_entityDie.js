import { DathCounter } from "./Death/event.js";
import { gravestone_main } from "./Others/gravestones.js";
import { onDeadFullBright } from "./FullBright/events.js";
import { magnetDie } from "./magnet/events.js";

const PLAYER_ACTIONS = [gravestone_main, DathCounter, magnetDie, onDeadFullBright];

const DEATH_ACTIONS = {
  "minecraft:player": PLAYER_ACTIONS,
};

export function onEntityDeath(event) {
  const entity = event.deadEntity;
  if (!entity) return;

  const actions = DEATH_ACTIONS[entity.typeId];
  if (!actions) return;

  if (Array.isArray(actions)) {
    for (let i = 0; i < actions.length; i++) {
      const fn = actions[i];
      if (!fn) continue;
      fn(event);
    }
  }
}
console.warn("[world afterEvents entityDie] loaded successfully");
