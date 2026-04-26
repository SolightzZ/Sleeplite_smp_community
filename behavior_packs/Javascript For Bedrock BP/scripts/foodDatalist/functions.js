import { EntityComponentTypes } from "@minecraft/server";
import { makeLore, getFoodData } from "./fooddata.js";

function updateItemLore(item, food) {
  if (!item || !food) return false;

  const newLore = makeLore(food);
  const currentLore = item.getLore();
  if (JSON.stringify(newLore) === JSON.stringify(currentLore)) {
    return false;
  }

  item.setLore(newLore);
  return true;
}

export function updatePlayerItems(player) {
  try {
    const invComp = player.getComponent(EntityComponentTypes.Inventory);

    if (!invComp || !invComp.container) {
      return;
    }

    const inv = invComp.container;

    for (let slot = 0; slot < inv.size; slot++) {
      const item = inv.getItem(slot);
      if (!item) continue;
      const food = getFoodData(item.typeId);
      if (!food) continue;

      if (updateItemLore(item, food)) {
        inv.setItem(slot, item);
      }
    }
  } catch (error) {
    console.warn(`Error updating Lore: ${error}`);
  }
}

console.warn("Food data loaded successfully");
