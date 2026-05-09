import { ItemStack } from "@minecraft/server";

export const spawnBatchedDrops = (dimension, location, typeId, count) => {
  if (count <= 0) return;
  let remaining = count;

  while (remaining > 0) {
    const stackSize = Math.min(remaining, 64);
    dimension.spawnItem(new ItemStack(typeId, stackSize), location);
    remaining -= stackSize;
  }
};
