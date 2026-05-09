import { BlockPermutation } from "@minecraft/server";

let airPerm = null;

export const getAirPerm = () => {
  if (!airPerm) airPerm = BlockPermutation.resolve("minecraft:air");
  return airPerm;
};

export const getLocKey = (x, y, z) => `${x},${y},${z}`;

export const getBlockSafe = (dim, loc) => {
  try {
    return dim.getBlock(loc);
  } catch {
    return undefined;
  }
};
