export const CONFIG = {
  ITEM: "minecraft:command_block",
  PREFIX_RANK: "rank:",
  PREFIX_ACTIVE: "active:",
  DEFAULT_RANK: "",
};

export const RANK_LEN = CONFIG.PREFIX_RANK.length;
export const ACTIVE_LEN = CONFIG.PREFIX_ACTIVE.length;
export const ADMIN_TAG = "admin";
export const OPEN_ITEM_TYPE = "minecraft:command_block";
export const STORAGE_KEY = "gamertag-addon-config";

export const defaultConfig = {
  enabled: true,
  defaultRank: "§7MEMBER",
  enabledStats: { rank: true, kills: true, deaths: true, health: true },
  scoreboardObjectives: { kills: "kills", deaths: "Deaths" },
};
