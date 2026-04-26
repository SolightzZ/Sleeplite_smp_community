import { ItemStack } from "@minecraft/server";
import { list, limit, range } from "./vals.js";

export function check(tool) {
  return tool && tool.typeId === "minecraft:light_block_13";
}

export function dig(boy, spot) {
  try {
    const drop = "minecraft:light_block_13";

    const pos = {
      x: spot.location.x + 0.5,
      y: spot.location.y + 0.5,
      z: spot.location.z + 0.5,
    };

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

  let count = 0;

  for (let x = Math.floor(px) - range; x <= px + range && count < limit; x++) {
    for (let z = Math.floor(pz) - range; z <= pz + range && count < limit; z++) {
      if (Math.abs(x - px) + Math.abs(z - pz) > range) continue;
      for (let y = low; y <= high && count < limit; y++) {
        const block = dim.getBlock({ x, y, z });
        if (!block || !list.includes(block.typeId)) continue;
        const level = block.permutation.getState("block_light_level") ?? 0;
        if (level <= 0) continue;
        boy.spawnParticle("light", { x: x + 0.5, y: y + 0.65, z: z + 0.5 });
        count++;
      }
    }
  }
  return count;
}
