import { world } from "@minecraft/server";
import { PREFIX_RANK, PREFIX_ACTIVE, RANK_PREFIX_LENGTH, ACTIVE_PREFIX_LENGTH } from "../constants/index.js";
import { isValidPlayer } from "../utils/player.js";

export const getOwnedRanks = (player) => {
  if (!isValidPlayer(player)) return [];

  const tags = player.getTags();
  const ranks = [];

  for (let i = 0; i < tags.length; i++) {
    if (tags[i].startsWith(PREFIX_RANK)) {
      ranks.push(tags[i].slice(RANK_PREFIX_LENGTH));
    }
  }

  return ranks;
};

export const getActiveRank = (player) => {
  if (!isValidPlayer(player)) return null;

  const tags = player.getTags();
  for (let i = 0; i < tags.length; i++) {
    if (tags[i].startsWith(PREFIX_ACTIVE)) {
      return tags[i].slice(ACTIVE_PREFIX_LENGTH);
    }
  }

  return null;
};

export const setActiveRank = (player, rankName) => {
  if (!isValidPlayer(player)) return false;

  const tags = player.getTags();
  for (let i = 0; i < tags.length; i++) {
    if (tags[i].startsWith(PREFIX_ACTIVE)) {
      player.removeTag(tags[i]);
    }
  }

  if (rankName) {
    player.addTag(PREFIX_ACTIVE + rankName);
  }

  return true;
};

export const getAllServerRanks = () => {
  const ranks = new Set();
  const players = world.getPlayers();

  for (let i = 0; i < players.length; i++) {
    const tags = players[i].getTags();

    for (let j = 0; j < tags.length; j++) {
      if (tags[j].startsWith(PREFIX_RANK)) {
        ranks.add(tags[j].slice(RANK_PREFIX_LENGTH));
      }
    }
  }

  return Array.from(ranks).sort();
};

export const addRank = (player, rankName) => {
  if (!isValidPlayer(player) || !rankName) return false;
  const fullTag = PREFIX_RANK + rankName;
  const tags = player.getTags();
  let exists = false;

  for (let i = 0; i < tags.length; i++) {
    if (tags[i] === fullTag) {
      exists = true;
      break;
    }
  }

  if (!exists) {
    player.addTag(fullTag);
  }

  setActiveRank(player, rankName);
  return true;
};

export const removeRanks = (player, ranks) => {
  if (!isValidPlayer(player) || !Array.isArray(ranks) || !ranks.length) return false;

  for (let i = 0; i < ranks.length; i++) {
    player.removeTag(PREFIX_RANK + ranks[i]);
    player.removeTag(PREFIX_ACTIVE + ranks[i]);
  }
  autoSetRemainingRank(player);
  return true;
};

export const renameRank = (player, oldName, newName) => {
  if (!isValidPlayer(player) || !oldName || !newName || oldName === newName) {
    return false;
  }

  const wasActive = getActiveRank(player) === oldName;
  player.removeTag(PREFIX_RANK + oldName);
  player.removeTag(PREFIX_ACTIVE + oldName);
  player.addTag(PREFIX_RANK + newName);

  if (wasActive) {
    setActiveRank(player, newName);
  } else {
    autoSetRemainingRank(player);
  }

  return true;
};

const autoSetRemainingRank = (player) => {
  const owned = getOwnedRanks(player);

  if (owned.length === 1) {
    setActiveRank(player, owned[0]);
  } else if (owned.length === 0) {
    setActiveRank(player, null);
  }
};
