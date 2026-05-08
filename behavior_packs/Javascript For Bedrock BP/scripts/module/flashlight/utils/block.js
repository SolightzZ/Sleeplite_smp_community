import { BlockPermutation } from "@minecraft/server";

let LIGHT_PERM = null;
let AIR_PERM = null;

export function getLightPerm() {
  if (!LIGHT_PERM) LIGHT_PERM = BlockPermutation.resolve("minecraft:light_block", { block_light_level: 15 });
  return LIGHT_PERM;
}

export function getAirPerm() {
  if (!AIR_PERM) AIR_PERM = BlockPermutation.resolve("minecraft:air");
  return AIR_PERM;
}
