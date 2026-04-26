export const CROP_DB = Object.freeze({
  LIST: new Set([
    "minecraft:wheat",
    "minecraft:carrots",
    "minecraft:potatoes",
    "minecraft:beetroot",
    "minecraft:nether_wart",
    "minecraft:melon_block",
    "minecraft:pumpkin",
    "minecraft:reeds",
    "minecraft:cactus",
    "minecraft:bamboo",
  ]),

  BONUS_DROPS: {
    "minecraft:carrots": "minecraft:carrot",
    "minecraft:potatoes": "minecraft:potato",
    "minecraft:melon_block": "minecraft:melon_slice",
    "minecraft:pumpkin": "minecraft:pumpkin",
    "minecraft:nether_wart": "minecraft:nether_wart",
    "minecraft:reeds": "minecraft:reeds",
    "minecraft:cactus": "minecraft:cactus",
    "minecraft:bamboo": "minecraft:bamboo",
    "minecraft:wheat": "minecraft:wheat_seeds",
    "minecraft:beetroot": "minecraft:beetroot_seeds",
  },

  VALID_TOOLS: new Set(["addon:wolf_hoe", "minecraft:diamond_hoe", "minecraft:netherite_hoe", "minecraft:golden_hoe", "minecraft:iron_hoe"]),
});
