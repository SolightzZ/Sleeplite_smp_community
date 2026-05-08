import { BlockPermutation } from "@minecraft/server";

let AIR_PERM = null;
export function getAirPerm() {
  if (!AIR_PERM) AIR_PERM = BlockPermutation.resolve("minecraft:air");
  return AIR_PERM;
}

export const getBlockSafe = (dimension, loc) => {
  try {
    return dimension.getBlock(loc);
  } catch {
    return undefined;
  }
};
