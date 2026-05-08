import { world, system } from "@minecraft/server";
import { SEAT_ENTITY_ID } from "../constants.js";

export function clearSeatsInDimension(dimensionName) {
  try {
    const dimension = world.getDimension(dimensionName);
    const entities = dimension.getEntities({ type: SEAT_ENTITY_ID });
    for (let i = 0; i < entities.length; i++) {
      entities[i].remove();
    }
  } catch { }
}

export function initCleanup() {
  system.run(() => {
    system.runTimeout(() => {
      clearSeatsInDimension("minecraft:overworld");
      clearSeatsInDimension("minecraft:nether");
      clearSeatsInDimension("minecraft:the_end");
    }, 1);
  });
}
