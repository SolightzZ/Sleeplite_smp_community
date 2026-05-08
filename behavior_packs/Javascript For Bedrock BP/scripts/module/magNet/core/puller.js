import { setting } from "../config.js";
import { hasUser } from "./state.js";

export function pullItem(player) {
  if (!player.isValid || !hasUser(player.id)) return;

  const loc = player.location;
  const target = { x: loc.x, y: loc.y + 0.8, z: loc.z };

  let totalPulled = 0;
  const pullLen = setting.canPull.length;

  for (let i = 0; i < pullLen; i++) {
    const typeId = setting.canPull[i];
    if (totalPulled >= setting.maxItem) break;

    const entities = player.dimension.getEntities({
      location: loc,
      maxDistance: setting.range,
      type: typeId
    });

    const entLen = entities.length;
    for (let j = 0; j < entLen; j++) {
      const entity = entities[j];
      if (totalPulled >= setting.maxItem) break;
      if (!entity.isValid) continue;

      entity.teleport(target, { dimension: player.dimension });
      totalPulled++;
    }
  }
}
