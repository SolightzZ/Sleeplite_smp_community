import { MagnetConfig } from "../config.js";
import { hasMagnetUser } from "./state.js";

export const pullItemsToPlayer = (player) => {
  if (!player.isValid || !hasMagnetUser(player.id)) return;

  const loc = player.location;
  const target = { x: loc.x, y: loc.y + 0.8, z: loc.z };
  let pulledCount = 0;

  const typeCount = MagnetConfig.PULLABLE_TYPES.length;
  for (let i = 0; i < typeCount; i++) {
    if (pulledCount >= MagnetConfig.MAX_ITEMS) break;

    const typeId = MagnetConfig.PULLABLE_TYPES[i];
    const entities = player.dimension.getEntities({
      location: loc,
      maxDistance: MagnetConfig.RANGE,
      type: typeId,
    });

    const entCount = entities.length;
    for (let j = 0; j < entCount; j++) {
      if (pulledCount >= MagnetConfig.MAX_ITEMS) break;

      const entity = entities[j];
      if (!entity.isValid) continue;
      entity.teleport(target, { dimension: player.dimension });
      pulledCount++;
    }
  }
};
