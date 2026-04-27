import { setting } from "./config.js";
import { hasUser } from "./state.js";

export function pullItem(player) {
  try {
    if (!hasUser(player.id)) return;

    const loc = player.location;
    const target = { x: loc.x, y: loc.y + 0.5, z: loc.z };

    let count = 0;
    for (const type of setting.canPull) {
      if (count >= setting.maxItem) break;

      const items = player.dimension.getEntities({
        location: loc,
        maxDistance: setting.range,
        type: type,
      });

      for (const item of items) {
        if (count >= setting.maxItem) break;

        if (item.isValid) {
          item.teleport(target);
          count++;
        }
      }
    }
  } catch (err) {
    console.warn(`Magnet Error: ${err}`);
  }
}
