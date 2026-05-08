import { BREATHABLE_EXACT, BREATHABLE_PREFIX } from "../data/breathable.js";

export const isBreathableBlock = (typeId) => {
  if (BREATHABLE_EXACT.has(typeId)) return true;
  for (let i = 0; i < BREATHABLE_PREFIX.length; i++) {
    if (typeId.includes(BREATHABLE_PREFIX[i])) return true;
  }
  return false;
};

export const isRemovedBlock = (typeId) =>
  typeId === "minecraft:air" ||
  typeId === "minecraft:water" ||
  typeId === "minecraft:flowing_water" ||
  typeId === "minecraft:sticky_piston_arm_collision" ||
  typeId === "minecraft:piston_arm_collision";
