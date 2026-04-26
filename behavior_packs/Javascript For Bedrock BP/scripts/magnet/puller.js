import { setting } from "./config.js";
import { hasUser } from "./state.js";

export function pullItem(player) {
  try {
    if (!hasUser(player.id)) return;

    const loc = player.location;
    const target = { x: loc.x, y: loc.y + 0.5, z: loc.z };

    const items = player.dimension.getEntities({
      location: loc,
      maxDistance: setting.range,
      excludeTypes: ["minecraft:player"],
    });

    let count = 0;
    for (const item of items) {
      if (count >= setting.maxItem) break;

      if (item.isValid && setting.canPull.includes(item.typeId)) {
        item.teleport(target);
        count++;
      }
    }
  } catch (err) {
    console.warn(`Magnet Error: ${err}`);
  }
}
