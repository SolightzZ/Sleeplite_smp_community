import { system, ItemStack, world } from "@minecraft/server";

export function isOreVein(block) {
  let oreCount = 1;

  const neighbors = [
    block.above(),
    block.below(),
    block.north(),
    block.south(),
    block.east(),
    block.west(),
  ];

  for (const ore of neighbors) {
    if (ore.typeId === block.typeId) {
      oreCount++;
    }
  }

  if (oreCount > 1) return true;
  else return false;
}

export function breakOreVein(block, item) {
  const validOres = pickaxeBreaks[item.typeId];
  const dimension = block.dimension;
  const targetId = block.typeId;

  if (!validOres.includes(targetId)) return;

  const queue = [
    block.above(),
    block.below(),
    block.north(),
    block.south(),
    block.east(),
    block.west(),
  ].filter((b) => b && b.typeId === targetId);

  system.runInterval(() => {
    if (queue.length === 0) return;

    const currentBatch = queue.splice(0, queue.length);

    for (const block of currentBatch) {
      if (!block || block.typeId !== targetId) continue;

      let level = 0;
      let itemDrop = oreDrop[targetId];
      const enchant = item.getComponent("enchantable");
      if (enchant.hasEnchantment("fortune")) {
        level = enchant.getEnchantment("fortune").level;
      } else if (enchant.hasEnchantment("silk_touch")) {
        itemDrop = targetId;
      }
      const count = enchant.hasEnchantment("fortune")
        ? Math.random() * level + 2
        : 1;
      const xpCount =
        oreXP[targetId] == 0
          ? 0
          : oreXP[targetId][Math.floor(Math.random() * oreXP[targetId].length)];

      block.setType("minecraft:air");
      dimension.spawnItem(new ItemStack(itemDrop, count), block.location);
      for (let i = 0; i < xpCount; i++) {
        dimension.spawnEntity("minecraft:xp_orb", block.location);
      }

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
  }, 2);
}

export const pickaxeBreaks = {
  "minecraft:wooden_pickaxe": [
    "minecraft:coal_ore",
    "minecraft:deepslate_coal_ore",
    "minecraft:nether_quartz_ore",
  ],

  "minecraft:stone_pickaxe": [
    "minecraft:coal_ore",
    "minecraft:deepslate_coal_ore",
    "minecraft:nether_quartz_ore",
    "minecraft:iron_ore",
    "minecraft:deepslate_iron_ore",
    "minecraft:copper_ore",
    "minecraft:deepslate_copper_ore",
    "minecraft:lapis_ore",
    "minecraft:deepslate_lapis_ore",
  ],

  "minecraft:iron_pickaxe": [
    "minecraft:coal_ore",
    "minecraft:deepslate_coal_ore",
    "minecraft:nether_quartz_ore",
    "minecraft:iron_ore",
    "minecraft:deepslate_iron_ore",
    "minecraft:copper_ore",
    "minecraft:deepslate_copper_ore",
    "minecraft:lapis_ore",
    "minecraft:deepslate_lapis_ore",
    "minecraft:gold_ore",
    "minecraft:deepslate_gold_ore",
    "minecraft:redstone_ore",
    "minecraft:deepslate_redstone_ore",
    "minecraft:diamond_ore",
    "minecraft:deepslate_diamond_ore",
    "minecraft:emerald_ore",
    "minecraft:deepslate_emerald_ore",
  ],

  "minecraft:golden_pickaxe": [
    "minecraft:coal_ore",
    "minecraft:deepslate_coal_ore",
    "minecraft:nether_quartz_ore",
  ],

  "minecraft:diamond_pickaxe": [
    "minecraft:coal_ore",
    "minecraft:deepslate_coal_ore",
    "minecraft:nether_quartz_ore",
    "minecraft:iron_ore",
    "minecraft:deepslate_iron_ore",
    "minecraft:copper_ore",
    "minecraft:deepslate_copper_ore",
    "minecraft:lapis_ore",
    "minecraft:deepslate_lapis_ore",
    "minecraft:gold_ore",
    "minecraft:deepslate_gold_ore",
    "minecraft:redstone_ore",
    "minecraft:deepslate_redstone_ore",
    "minecraft:diamond_ore",
    "minecraft:deepslate_diamond_ore",
    "minecraft:emerald_ore",
    "minecraft:deepslate_emerald_ore",
    "minecraft:ancient_debris",
  ],

  "minecraft:netherite_pickaxe": [
    "minecraft:coal_ore",
    "minecraft:deepslate_coal_ore",
    "minecraft:nether_quartz_ore",
    "minecraft:iron_ore",
    "minecraft:deepslate_iron_ore",
    "minecraft:copper_ore",
    "minecraft:deepslate_copper_ore",
    "minecraft:lapis_ore",
    "minecraft:deepslate_lapis_ore",
    "minecraft:gold_ore",
    "minecraft:deepslate_gold_ore",
    "minecraft:redstone_ore",
    "minecraft:deepslate_redstone_ore",
    "minecraft:diamond_ore",
    "minecraft:deepslate_diamond_ore",
    "minecraft:emerald_ore",
    "minecraft:deepslate_emerald_ore",
    "minecraft:ancient_debris",
  ],
};

const oreDrop = {
  "minecraft:coal_ore": "minecraft:coal",
  "minecraft:deepslate_coal_ore": "minecraft:coal",
  "minecraft:nether_quartz_ore": "minecraft:quartz",

  "minecraft:iron_ore": "minecraft:raw_iron",
  "minecraft:deepslate_iron_ore": "minecraft:raw_iron",

  "minecraft:copper_ore": "minecraft:raw_copper",
  "minecraft:deepslate_copper_ore": "minecraft:raw_copper",

  "minecraft:lapis_ore": "minecraft:lapis_lazuli",
  "minecraft:deepslate_lapis_ore": "minecraft:lapis_lazuli",

  "minecraft:gold_ore": "minecraft:raw_gold",
  "minecraft:deepslate_gold_ore": "minecraft:raw_gold",

  "minecraft:redstone_ore": "minecraft:redstone",
  "minecraft:deepslate_redstone_ore": "minecraft:redstone",

  "minecraft:diamond_ore": "minecraft:diamond",
  "minecraft:deepslate_diamond_ore": "minecraft:diamond",

  "minecraft:emerald_ore": "minecraft:emerald",
  "minecraft:deepslate_emerald_ore": "minecraft:emerald",

  "minecraft:ancient_debris": "minecraft:netherite_scrap",
};

const oreXP = {
  "minecraft:coal_ore": [0, 1, 2],
  "minecraft:deepslate_coal_ore": [0, 1, 2],
  "minecraft:nether_quartz_ore": [2, 3, 4, 5],

  "minecraft:iron_ore": [0],
  "minecraft:deepslate_iron_ore": [0],

  "minecraft:copper_ore": [0],
  "minecraft:deepslate_copper_ore": [0],

  "minecraft:lapis_ore": [2, 3, 4, 5],
  "minecraft:deepslate_lapis_ore": [2, 3, 4, 5],

  "minecraft:gold_ore": [0],
  "minecraft:deepslate_gold_ore": [0],

  "minecraft:redstone_ore": [1, 2, 3, 4, 5],
  "minecraft:deepslate_redstone_ore": [1, 2, 3, 4, 5],

  "minecraft:diamond_ore": [3, 4, 5, 6, 7],
  "minecraft:deepslate_diamond_ore": [3, 4, 5, 6, 7],

  "minecraft:emerald_ore": [3, 4, 5, 6, 7],
  "minecraft:deepslate_emerald_ore": [3, 4, 5, 6, 7],

  "minecraft:ancient_debris": [0],
};
