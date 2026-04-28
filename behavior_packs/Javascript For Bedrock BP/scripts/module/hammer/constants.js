export const CONFIG = Object.freeze({
  BATCH_SIZE: 2,
  RADIUS: 1,
  SNEAK_CANCEL: true,
  TOOLS: new Set(["addon:wolf_pickaxe"]),
  IGNORE_BLOCKS: new Set(["minecraft:bedrock", "minecraft:obsidian", "minecraft:barrier"]),
  TargetKeywords: ["tuff", "stone", "metal", "ore", "dirt", "grass", "gravel", "sand", "deepslate"],
});

export const job = {
  ID_AIR: "minecraft:air",
  ID_XP_ORB: "minecraft:xp_orb",
  ID_EQUIPPABLE: "minecraft:equippable",

  SOUND_DIG: "dig.stone",
  SOUND_BREAK: "random.break",

  CENTER_OFFSET: 0.5,
  SOUND_VOLUME: 0.5,
  PITCH_BASE: 0.8,
  PITCH_VARIANCE: 0.4,
};

export const logic = {
  COMP_ENCHANTABLE: "minecraft:enchantable",
  COMP_EQUIPPABLE: "minecraft:equippable",
  ENCH_FORTUNE: "fortune",
  ENCH_SILK: "silk_touch",
  ENCH_UNBREAKING: "unbreaking",

  PREFIX_DEEPSLATE: "deepslate_",
  KEY_ORE: "ore",
  KEY_LAPIS: "lapis",
  KEY_REDSTONE: "redstone",
  KEY_COPPER: "copper",
  KEY_STONE: "stone",
  KEY_DEEPSLATE: "deepslate",

  MULT_HIGH: 4,
  MULT_MID: 2,
  MULT_BASE: 1,
  MAX_STACK: 64,
};

export const math = {
  AXIS_X: "x",
  AXIS_Y: "y",
  AXIS_Z: "z",

  ANGLE_LOW: 45,
  ANGLE_HIGH: 135,
};
