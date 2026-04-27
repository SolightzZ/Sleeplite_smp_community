import { system, ItemStack, world } from "@minecraft/server";

export const isOreVein = (block) => {
  const typeId = block.typeId;
  if (block.above()?.typeId === typeId) return true;
  if (block.below()?.typeId === typeId) return true;
  if (block.north()?.typeId === typeId) return true;
  if (block.south()?.typeId === typeId) return true;
  if (block.east()?.typeId === typeId) return true;
  if (block.west()?.typeId === typeId) return true;
  return false;
};

export const breakOreVein = (block, item) => {
  const validOres = pickaxeBreaks[item.typeId];
  const dimension = block.dimension;
  const targetId = block.typeId;

  if (!validOres?.includes(targetId)) return;

  const queue = [];
  const pushIfValid = (b) => {
    if (b && b.typeId === targetId) queue.push(b);
  };

  pushIfValid(block.above());
  pushIfValid(block.below());
  pushIfValid(block.north());
  pushIfValid(block.south());
  pushIfValid(block.east());
  pushIfValid(block.west());

  const handle = system.runInterval(() => {
    if (queue.length === 0) {
      system.clearRun(handle);
      return;
    }

    const currentBatch = queue.splice(0, queue.length);

    for (const b of currentBatch) {
      if (!b || b.typeId !== targetId) continue;

      let level = 0;
      let itemDrop = oreDrop[targetId];
      const enchant = item.getComponent("enchantable");
      
      const hasFortune = enchant?.hasEnchantment("fortune");
      if (hasFortune) {
        level = enchant.getEnchantment("fortune").level;
      } else if (enchant?.hasEnchantment("silk_touch")) {
        itemDrop = targetId;
      }
      
      const count = hasFortune ? Math.random() * level + 2 : 1;
      
      const xpArr = oreXP[targetId];
      const xpCount = (!xpArr || xpArr === 0) ? 0 : xpArr[Math.floor(Math.random() * xpArr.length)];

      b.setType("minecraft:air");
      dimension.spawnItem(new ItemStack(itemDrop, count), b.location);
      for (let i = 0; i < xpCount; i++) {
        dimension.spawnEntity("minecraft:xp_orb", b.location);
      }

      pushIfValid(b.above());
      pushIfValid(b.below());
      pushIfValid(b.north());
      pushIfValid(b.south());
      pushIfValid(b.east());
      pushIfValid(b.west());
    }
  }, 2);
};

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
