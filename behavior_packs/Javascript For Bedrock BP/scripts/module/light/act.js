import { ItemStack } from "@minecraft/server";
import { list } from "./main.js";

const range = 12; // Reduced range slightly to protect TPS
const limit = 64;

function check(tool) {
  return tool?.typeId === "minecraft:light_block_13";
}

/**
 * Optimized light block search.
 * Uses a smaller range and more efficient loop to avoid script watchdog timeouts.
 */
function shine(boy) {
  const dim = boy.dimension;
  const { x: px, y: py, z: pz } = boy.location;

  const fpx = Math.floor(px);
  const fpy = Math.floor(py);
  const fpz = Math.floor(pz);

  const low = Math.max(fpy - range, dim.heightRange.min);
  const high = Math.min(fpy + range, dim.heightRange.max);

  let count = 0;

  // Search in a more focused area first (Manhattan distance)
  for (let x = fpx - range; x <= fpx + range; x++) {
    for (let z = fpz - range; z <= fpz + range; z++) {
      // Manhattan distance check to make the search area a diamond shape (more efficient)
      if (Math.abs(x - fpx) + Math.abs(z - fpz) > range) continue;

      for (let y = low; y <= high; y++) {
        const block = dim.getBlock({ x, y, z });
        if (!block || !list.has(block.typeId)) continue;

        // Found a light block with light level > 0
        const level = block.permutation.getState("block_light_level") ?? 0;
        if (level <= 0) continue;

        boy.spawnParticle("light", { x: x + 0.5, y: y + 0.65, z: z + 0.5 });
        count++;

        if (count >= limit) return count;
      }
    }
  }
  return count;
}

export { check, limit, shine };
