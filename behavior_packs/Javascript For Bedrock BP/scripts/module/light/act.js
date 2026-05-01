import { ItemStack } from "@minecraft/server";
import { limit, list, range } from "./vals.js";

export function check(tool) {
  return tool?.typeId === "minecraft:light_block_13";
}

export function dig(boy, spot) {
  try {
    const drop = "minecraft:light_block_13";
    const { x, y, z } = spot.location;
    const pos = { x: x + 0.5, y: y + 0.5, z: z + 0.5 };

    boy.dimension.spawnItem(new ItemStack(drop, 1), pos);
    spot.setType("minecraft:air");
  } catch (err) {
    boy.sendMessage("§cCannot break this!");
  }
}

export function shine(boy) {
  const dim = boy.dimension;
  const { x: px, y: py, z: pz } = boy.location;

  const low = Math.max(Math.floor(py - range), dim.heightRange.min);
  const high = Math.min(Math.floor(py + range), dim.heightRange.max);

  const fpx = Math.floor(px);
  const fpz = Math.floor(pz);

  let count = 0;

  for (let x = fpx - range; x <= fpx + range; x++) {
    for (let z = fpz - range; z <= fpz + range; z++) {
      if (Math.abs(x - fpx) + Math.abs(z - fpz) > range) continue;

      for (let y = low; y <= high; y++) {
        const block = dim.getBlock({ x, y, z });
        if (!block || !list.has(block.typeId)) continue;

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
