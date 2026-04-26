const GRAVESTONE_ENTITY = "true:gravestone_storage";
const ITEM_ENTITY = "minecraft:item";
const INVENTORY_COMPONENT = "minecraft:inventory";
const MAX_ITEM_RADIUS = 4;
const CENTER_OFFSET = 0.5;

const DIMENSION_HEIGHT_RULE = {
  "minecraft:overworld": { minY: -64, baseY: -55 },
  "minecraft:the_end": { minY: 0, baseY: 50 },
};

function floorPosition(location) {
  return {
    x: Math.floor(location.x),
    y: Math.floor(location.y),
    z: Math.floor(location.z),
  };
}

function getGraveY(dimensionId, y) {
  const rule = DIMENSION_HEIGHT_RULE[dimensionId];
  return rule ? (y < rule.minY ? rule.baseY : y + 1) : y + 1;
}

function findNearbyItems(dimension, location) {
  return dimension.getEntities({
    location,
    type: ITEM_ENTITY,
    maxDistance: MAX_ITEM_RADIUS,
  });
}

function safeAddItem(container, itemStack) {
  try {
    container.addItem(itemStack);
    return true;
  } catch {
    return false;
  }
}

export function gravestone_main({ deadEntity: deadPlayer }) {
  if (!deadPlayer || !deadPlayer.dimension || !deadPlayer.location) return;

  const dimension = deadPlayer.dimension;
  const pos = floorPosition(deadPlayer.location);

  const items = findNearbyItems(dimension, pos);
  if (!items || items.length === 0) return;

  const graveY = getGraveY(dimension.id, pos.y);

  const grave = dimension.spawnEntity(GRAVESTONE_ENTITY, {
    x: pos.x - CENTER_OFFSET,
    y: graveY,
    z: pos.z - CENTER_OFFSET,
  });

  grave.nameTag = `§c[${deadPlayer.nameTag || "Player"}'s Gravestone]`;

  const inventory = grave.getComponent(INVENTORY_COMPONENT);
  const container = inventory?.container;
  if (!container) return;

  for (const drop of items) {
    const itemData = drop.getComponent("minecraft:item")?.itemStack;
    if (!itemData) continue;

    const added = safeAddItem(container, itemData);

    if (added) {
      try {
        drop.remove();
      } catch (e) {
        console.warn("[Gravestone] Failed" + e);
      }
    }
  }
}
console.warn("Gravestone loaded successfully");
