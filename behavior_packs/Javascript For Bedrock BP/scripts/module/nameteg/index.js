import { system } from "@minecraft/server";
import { initNametagSystem } from "./events.js";
export {
  ACTIVE_LEN,
  ADMIN_TAG,
  CONFIG,
  defaultConfig,
  OPEN_ITEM_TYPE,
  RANK_LEN,
} from "./config.js";
export {
  chatrankssitemUse,
  gamertagItemUse,
  initNametagSystem,
  playerJoinNameTag,
} from "./events.js";
export {
  addRank,
  buildAdvancedNameTag,
  getActiveRank,
  getAllServerRanks,
  getOwnedRanks,
  refreshAdvancedNameTag,
  refreshNameTag,
  removeRanks,
  renameRank,
  setActiveRank,
} from "./rank.js";
export {
  addScore,
  ensureObjective,
  getObjective,
  getScore,
} from "./scoreboard.js";
export { GT_CONFIG, loadGamertagConfig, Storage } from "./storage.js";
export { isValidPlayer } from "./utils.js";

system.run(initNametagSystem);
