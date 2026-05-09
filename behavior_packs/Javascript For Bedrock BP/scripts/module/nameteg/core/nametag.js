import { DEFAULT_RANK } from "../constants/index.js";
import { isValidPlayer } from "../utils/player.js";
import { getActiveRank, getOwnedRanks } from "./tagManager.js";

export const refreshNameTag = (player) => {
  if (!isValidPlayer(player)) return false;
  const tags = player.getTags();
  const active = getActiveRank(player) || getActiveRankFromTags(tags);
  const owned = getOwnedRanks(player);
  const display = active || (owned.length === 0 ? DEFAULT_RANK : "");
  player.nameTag = display ? `${display} ${player.name}` : player.name;
  return true;
};

const getActiveRankFromTags = (tags) => {
  for (let i = 0; i < tags.length; i++) {
    if (tags[i].startsWith("active:")) {
      return tags[i].slice(7);
    }
  }
  return null;
};

export const removeNameTag = (player) => {
  if (!isValidPlayer(player)) return false;
  player.nameTag = player.name;
  return true;
};

export const refreshNameTagOnJoin = refreshNameTag;
