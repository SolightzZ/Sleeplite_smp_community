import { EquipmentSlot } from "@minecraft/server";
import { CONFIG } from "./constants.js";
import { CROP_DB } from "./database.js";
import { getLocKey } from "./math.js";

export const isValidTool = (itemStack) => itemStack && CROP_DB.VALID_TOOLS.has(itemStack.typeId);
export const isValidCrop = (block) => block && CROP_DB.LIST.has(block.typeId);

export const getFortuneLevel = (item, player) => {
  const comp =
    item?.getComponent("minecraft:enchantable") ||
    player?.getComponent("minecraft:equippable")?.getEquipment(EquipmentSlot.Mainhand)?.getComponent("minecraft:enchantable");
  return comp?.getEnchantment("fortune")?.level || 0;
};

export const scanNearbyCrops = (startBlock) => {
  const found = [];
  const visited = new Set();
  const queue = [startBlock.location];
  const dimension = startBlock.dimension;
  const targetTypeId = startBlock.typeId;

  let count = 0;

  while (queue.length > 0 && count < CONFIG.HARVEST_LIMIT) {
    const currentLoc = queue.shift();
    const key = getLocKey(currentLoc);

    if (visited.has(key)) continue;
    visited.add(key);

    const block = dimension.getBlock(currentLoc);

    if (!block || block.typeId !== targetTypeId) continue;

    found.push(currentLoc);
    count++;

    for (const dir of CONFIG.DIRECTIONS) {
      queue.push({
        x: currentLoc.x + dir.x,
        y: currentLoc.y + dir.y,
        z: currentLoc.z + dir.z,
      });
    }
  }
  return found;
};
