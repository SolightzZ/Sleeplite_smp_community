import { system, ItemStack } from "@minecraft/server";

export const isTree = (block) => {
  if (!logTypes.includes(block.typeId)) return false;

  let current = block.above();
  while (current) {
    const id = current.typeId;
    if (logTypes.includes(id)) {
      current = current.above();
      continue;
    }
    if (leafTypes.includes(id)) {
      return true;
    }
    return false;
  }
  return false;
};

export const breakTree = (startBlock) => {
  const dimension = startBlock.dimension;
  const targetId = startBlock.typeId;

  const queue = [];
  const pushIfValid = (b) => {
    if (b && b.typeId === targetId) queue.push(b);
  };

  pushIfValid(startBlock.above());
  pushIfValid(startBlock.below());
  pushIfValid(startBlock.north());
  pushIfValid(startBlock.south());
  pushIfValid(startBlock.east());
  pushIfValid(startBlock.west());

  const handle = system.runInterval(() => {
    if (queue.length === 0) {
      system.clearRun(handle);
      return;
    }

    const currentBatch = queue.splice(0, queue.length);

    for (const block of currentBatch) {
      if (!block || block.typeId !== targetId) continue;

      block.setType("minecraft:air");
      dimension.spawnItem(new ItemStack(targetId, 1), block.location);

      pushIfValid(block.above());
      pushIfValid(block.below());
      pushIfValid(block.north());
      pushIfValid(block.south());
      pushIfValid(block.east());
      pushIfValid(block.west());
    }
  }, 1);
};

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
