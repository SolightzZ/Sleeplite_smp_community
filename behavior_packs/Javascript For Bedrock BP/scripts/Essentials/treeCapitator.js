import { system, ItemStack } from "@minecraft/server";

export function isTree(block) {
  if (!logTypes.includes(block.typeId)) return false;

  const dimension = block.dimension;
  let { x, y, z } = block.location;

  while (true) {
    y++;
    const location = { x: x, y: y, z: z };
    const nextBlock = dimension.getBlock(location);
    if (!nextBlock) return false;

    const id = nextBlock.typeId;

    if (logTypes.includes(id)) {
      continue;
    }

    if (leafTypes.includes(id)) {
      return true;
    }

    return false;
  }
}

export function breakTree(startBlock) {
  const dimension = startBlock.dimension;
  const targetId = startBlock.typeId;

  const queue = [
    startBlock.above(),
    startBlock.below(),
    startBlock.north(),
    startBlock.south(),
    startBlock.east(),
    startBlock.west(),
  ].filter((b) => b && b.typeId === targetId);

  system.runInterval(() => {
    if (queue.length === 0) return;

    const currentBatch = queue.splice(0, queue.length);

    for (const block of currentBatch) {
      if (!block || block.typeId !== targetId) continue;

      block.setType("minecraft:air");
      dimension.spawnItem(new ItemStack(targetId, 1), block.location);

      const neighbors = [
        block.above(),
        block.below(),
        block.north(),
        block.south(),
        block.east(),
        block.west(),
      ];

      for (const next of neighbors) {
        if (next && next.typeId === targetId) {
          queue.push(next);
        }
      }
    }
  }, 1);
}

const logTypes = [
  "minecraft:oak_log",
  "minecraft:birch_log",
  "minecraft:spruce_log",
  "minecraft:jungle_log",
  "minecraft:acacia_log",
  "minecraft:dark_oak_log",
  "minecraft:mangrove_log",
  "minecraft:cherry_log",
  "minecraft:pale_oak_log",
  "minecraft:crimson_stem",
  "minecraft:warped_stem",
];

const leafTypes = [
  "minecraft:oak_leaves",
  "minecraft:birch_leaves",
  "minecraft:spruce_leaves",
  "minecraft:jungle_leaves",
  "minecraft:acacia_leaves",
  "minecraft:dark_oak_leaves",
  "minecraft:mangrove_leaves",
  "minecraft:cherry_leaves",
  "minecraft:pale_oak_leaves",
  "minecraft:warped_wart_block",
  "minecraft:nether_wart_block",
  "minecraft:crimson_hyphae",
];
