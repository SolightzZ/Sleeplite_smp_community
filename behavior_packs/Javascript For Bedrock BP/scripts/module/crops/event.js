import { system, ItemStack } from "@minecraft/server";
import { CROP_DB } from "./database.js";
import { sortByDistance } from "./math.js";
import { isValidTool, isValidCrop, getFortuneLevel, scanNearbyCrops } from "./farming.js";

const spawnFortuneBonus = (dimension, location, typeId, level) => {
  const bonusItemName = CROP_DB.BONUS_DROPS[typeId];
  if (!bonusItemName || level <= 0) return;

  const bonusAmount = Math.floor(Math.random() * (level + 1));
  if (bonusAmount > 0) {
    try {
      const item = new ItemStack(bonusItemName, bonusAmount);
      dimension.spawnItem(item, { x: location.x + 0.5, y: location.y + 0.5, z: location.z + 0.5 });
    } catch (e) {
      console.warn(e);
    }
  }
};

function* harvestJobExecutor(dimension, targets, fortuneLevel, typeId) {
  for (const location of targets) {
    const block = dimension.getBlock(location);
    if (!block || block.typeId !== typeId) continue;

    dimension.runCommand(`setblock ${location.x} ${location.y} ${location.z} air destroy`);

    spawnFortuneBonus(dimension, location, typeId, fortuneLevel);

    yield;
  }
}

export const onCropBreak = (event) => {
  const { block, player, itemStack } = event;

  if (!player.isSneaking) return;
  if (!isValidTool(itemStack)) return;
  if (!isValidCrop(block)) return;

  event.cancel = true;

  const fortuneLevel = getFortuneLevel(itemStack, player);
  const startLoc = block.location;
  const typeId = block.typeId;

  const targets = scanNearbyCrops(block).sort(sortByDistance(startLoc));

  system.runJob(harvestJobExecutor(block.dimension, targets, fortuneLevel, typeId));
};
