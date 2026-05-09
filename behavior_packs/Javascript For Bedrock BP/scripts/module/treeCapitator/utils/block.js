import { BlockPermutation } from "@minecraft/server";

let airPerm = null;

export const getAirPerm = () => {
  if (!airPerm) airPerm = BlockPermutation.resolve("minecraft:air");
  return airPerm;
};

export const getBlockSafe = (dim, loc) => {
  try {
    return dim.getBlock(loc);
  } catch (e) {
    console.error("[ treeCapitator ] block: " + e);
    return undefined;
  }
};
