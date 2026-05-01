import { ItemStack, system, world } from "@minecraft/server";

const LOG_TYPES = new Set([
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
]);

const LEAF_TYPES = new Set([
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
]);

const getNeighbors = (block) => [
  block.above(),
  block.below(),
  block.north(),
  block.south(),
  block.east(),
  block.west(),
];

const hasAdjacentLeaf = (block) => {
  const neighbors = getNeighbors(block);
  for (let i = 0; i < neighbors.length; i++) {
    const neighbor = neighbors[i];
    if (neighbor && LEAF_TYPES.has(neighbor.typeId)) return true;
  }
  return false;
};

const isTree = (block) => {
  if (!LOG_TYPES.has(block.typeId)) return false;

  const below = block.below();
  if (below && LOG_TYPES.has(below.typeId)) return false;

  const logs = [block];
  let current = block.above();
  while (current && LOG_TYPES.has(current.typeId)) {
    logs.push(current);
    current = current.above();
  }

  for (let i = 0; i < logs.length; i++) {
    if (hasAdjacentLeaf(logs[i])) return true;
  }
  return false;
};

const breakTree = (startBlock) => {
  const { dimension, typeId: targetId } = startBlock;

  const queue = [];
  const firstAbove = startBlock.above();
  if (firstAbove && firstAbove.typeId === targetId) queue.push(firstAbove);

  const handle = system.runInterval(() => {
    if (queue.length === 0) {
      system.clearRun(handle);
      return;
    }

    const batch = queue.splice(0, queue.length);

    for (let i = 0; i < batch.length; i++) {
      const block = batch[i];
      if (!block || block.typeId !== targetId) continue;

      block.setType("minecraft:air");
      dimension.spawnItem(new ItemStack(targetId, 1), block.location);

      const next = block.above();
      if (next && next.typeId === targetId) queue.push(next);
    }
  }, 1);
};

function handleTreeCapitator(event) {
  const { player, block, itemStack } = event;
  const isAxe =
    itemStack?.typeId.includes("axe") && !itemStack?.typeId.includes("pick");
  if (player.isSneaking && isAxe && isTree(block)) {
    breakTree(block);
  }
}

world.beforeEvents.playerBreakBlock.subscribe(handleTreeCapitator);
