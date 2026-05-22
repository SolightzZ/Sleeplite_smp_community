import { GRAVESTONE_ENTITY, DIMENSION_HEIGHT_RULE, CENTER_OFFSET, INVENTORY_COMPONENT } from "../config.js";
import { floorPosition, getGraveY } from "../utils/location.js";
import { findNearbyItems, safeAddItem } from "./container.js";

export function gravestone_main({ deadEntity: deadPlayer }) {
  if (!deadPlayer || !deadPlayer.isValid || deadPlayer.typeId !== "minecraft:player") return;

  const dimension = deadPlayer.dimension;
  const pos = floorPosition(deadPlayer.location);

  const items = findNearbyItems(dimension, pos);
  if (!items || items.length === 0) return;

  const graveY = getGraveY(dimension.id, pos.y, DIMENSION_HEIGHT_RULE);

  const grave = dimension.spawnEntity(GRAVESTONE_ENTITY, {
    x: pos.x - CENTER_OFFSET,
    y: graveY,
    z: pos.z - CENTER_OFFSET,
  });

  grave.nameTag = `§cGraveStone\n${deadPlayer.nameTag || deadPlayer.name || "Player" || deadPlayer.id}`;

  const inventory = grave.getComponent(INVENTORY_COMPONENT);
  const container = inventory?.container;
  if (!container) return;

  const len = items.length;
  for (let i = 0; i < len; i++) {
    const drop = items[i];
    if (!drop.isValid) continue;

    const itemData = drop.getComponent("minecraft:item")?.itemStack;
    if (!itemData) continue;

    const added = safeAddItem(container, itemData);

    if (added) {
      try {
        drop.remove();
      } catch (e) {
        console.error("[Gravestone] Error removing drop:", e);
      }
    } else {
      break;
    }
  }
}
