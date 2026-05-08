import { world } from "@minecraft/server";
import { ACTIVE_LEN, CONFIG, RANK_LEN } from "./config.js";
import { getScore } from "./scoreboard.js";
import { GT_CONFIG } from "./storage.js";
import { isValidPlayer } from "./utils.js";

export const getOwnedRanks = (player, tags = player.getTags()) => {
  const out = [];
  for (let i = 0; i < tags.length; i++) {
    if (tags[i].startsWith(CONFIG.PREFIX_RANK))
      out.push(tags[i].slice(RANK_LEN));
  }
  return out;
};

export const getActiveRank = (player, tags = player.getTags()) => {
  for (let i = 0; i < tags.length; i++) {
    if (tags[i].startsWith(CONFIG.PREFIX_ACTIVE))
      return tags[i].slice(ACTIVE_LEN);
  }
  return null;
};

export const getAllServerRanks = () => {
  const ranks = new Set();
  const players = world.getPlayers();
  for (let i = 0; i < players.length; i++) {
    const tags = players[i].getTags();
    for (let j = 0; j < tags.length; j++) {
      if (tags[j].startsWith(CONFIG.PREFIX_RANK))
        ranks.add(tags[j].slice(RANK_LEN));
    }
  }
  const arr = [];
  for (const r of ranks) arr.push(r);
  return arr.sort();
};

export const refreshNameTag = (player) => {
  if (!isValidPlayer(player)) return;
  const tags = player.getTags();
  const active = getActiveRank(player, tags);
  const owned = getOwnedRanks(player, tags);
  const display = active || (owned.length === 0 ? CONFIG.DEFAULT_RANK : "");
  player.nameTag = display ? `${display} ${player.name}` : player.name;
};

export const setActiveRank = (player, rankName) => {
  const tags = player.getTags();
  for (let i = 0; i < tags.length; i++) {
    if (tags[i].startsWith(CONFIG.PREFIX_ACTIVE)) player.removeTag(tags[i]);
  }
  if (rankName) player.addTag(CONFIG.PREFIX_ACTIVE + rankName);
  refreshNameTag(player);
};

export const addRank = (player, rankName) => {
  if (!rankName) return;
  const tags = player.getTags();
  const full = CONFIG.PREFIX_RANK + rankName;
  for (let i = 0; i < tags.length; i++) {
    if (tags[i] === full) return;
  }
  player.addTag(full);
  setActiveRank(player, rankName);
};

export const renameRank = (player, oldName, newName) => {
  if (!oldName || !newName || oldName === newName) return;
  const tags = player.getTags();
  player.removeTag(CONFIG.PREFIX_RANK + oldName);
  player.addTag(CONFIG.PREFIX_RANK + newName);
  if (getActiveRank(player, tags) === oldName) setActiveRank(player, newName);
};

export const removeRanks = (player, ranks) => {
  const tags = player.getTags();
  const active = getActiveRank(player, tags);
  let removedActive = false;

  for (let i = 0; i < ranks.length; i++) {
    player.removeTag(CONFIG.PREFIX_RANK + ranks[i]);
    if (ranks[i] === active) removedActive = true;
  }

  if (removedActive) {
    for (let i = 0; i < tags.length; i++) {
      if (tags[i].startsWith(CONFIG.PREFIX_ACTIVE)) player.removeTag(tags[i]);
    }
    refreshNameTag(player);
  }
};

export const buildAdvancedNameTag = (player) => {
  if (!isValidPlayer(player)) return;
  const tags = player.getTags();
  const active = getActiveRank(player, tags);
  const owned = getOwnedRanks(player, tags);
  const rankDisplay = active || (owned.length === 0 ? CONFIG.DEFAULT_RANK : "");

  const lines = [];

  if (GT_CONFIG.enabledStats.rank) {
    const displayName = rankDisplay
      ? `${rankDisplay} §r${player.name}`
      : player.name;
    lines.push(displayName);
  } else {
    lines.push(player.name);
  }

  const stats = [];

  if (GT_CONFIG.enabledStats.kills) {
    const kills = getScore(player, GT_CONFIG.scoreboardObjectives.kills);
    stats.push(` §e${kills}`);
  }

  if (GT_CONFIG.enabledStats.deaths) {
    const deaths = getScore(player, GT_CONFIG.scoreboardObjectives.deaths);
    stats.push(` §4${deaths}`);
  }

  if (GT_CONFIG.enabledStats.health) {
    const health = Math.round(
      player.getComponent("minecraft:health")?.currentValue ?? 0,
    );
    stats.push(` §c${health}`);
  }

  if (stats.length) {
    lines.push(stats.join(" "));
  }

  return lines.join("\n");
};

export const refreshAdvancedNameTag = (player) => {
  if (!isValidPlayer(player)) return;
  player.nameTag = buildAdvancedNameTag(player);
};
