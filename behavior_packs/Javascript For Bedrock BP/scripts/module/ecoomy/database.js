import { world, Player } from "@minecraft/server";
import { CONFIG, DEFAULTS } from "./constants.js";

let cachedObjective = null;

export function getBankObjective() {
  if (!cachedObjective) {
    try {
      cachedObjective = world.scoreboard.getObjective(CONFIG.BANK_DB_NAME);
    } catch (e) {
      console.warn("[DB] getBankObjective:", e);
      return null;
    }
  }
  return cachedObjective;
}

export function initializeObjective() {
  try {
    if (!world.scoreboard.getObjective(CONFIG.BANK_DB_NAME)) {
      world.scoreboard.addObjective(CONFIG.BANK_DB_NAME, CONFIG.BANK_DISPLAY_NAME);
    }
    cachedObjective = world.scoreboard.getObjective(CONFIG.BANK_DB_NAME);
  } catch (e) {
    console.warn("[DB] initializeObjective:", e);
  }
}

function getScore(key) {
  try {
    const objective = getBankObjective();
    return objective?.getScore(key) ?? DEFAULTS.BALANCE;
  } catch (e) {
    return DEFAULTS.BALANCE;
  }
}

function setScore(key, value) {
  try {
    const objective = getBankObjective();
    objective?.setScore(key, Math.floor(value));
  } catch (e) {
    console.warn("[DB] setScore:", key, e);
  }
}

function getPlayerKey(player) {
  try {
    return player instanceof Player ? player.name : String(player);
  } catch (e) {
    return DEFAULTS.PLAYER_KEY;
  }
}

function getInterestKey(player) {
  return `+${getPlayerKey(player)}`;
}

export function getBalance(player) {
  return getScore(getPlayerKey(player));
}

export function setBalance(player, value) {
  setScore(getPlayerKey(player), value);
}

export function addBalance(player, value) {
  if (value <= 0) return;

  const key = getPlayerKey(player);
  const current = getScore(key);
  setScore(key, current + value);
}

export function removeBalance(player, value) {
  const key = getPlayerKey(player);
  const current = getScore(key);

  if (current < value) return current;

  const newBalance = current - value;
  setScore(key, newBalance);
  return newBalance;
}

export function getInterestDate(player) {
  return getScore(getInterestKey(player));
}

export function setInterestDate(player, dateValue) {
  setScore(getInterestKey(player), dateValue);
}

export function initializeInterest(player) {
  const key = getInterestKey(player);
  const current = getScore(key);

  if (current === undefined || current === null) {
    setScore(key, 0);
  }
}

export function getAllBankPlayers() {
  const objective = getBankObjective();
  if (!objective) return [];

  try {
    return [...objective.getScores()]
      .map((s) => s.participant.displayName)
      .filter((name, i, arr) => !name.startsWith("+") && arr.indexOf(name) === i)
      .sort();
  } catch (e) {
    console.warn("[DB] getAllBankPlayers:", e);
    return [];
  }
}

export function batchOperations(operations) {
  const objective = getBankObjective();
  if (!objective) return;

  for (const op of operations) {
    const key = getPlayerKey(op.player);

    try {
      switch (op.operation) {
        case "add":
          const current = objective.getScore(key) ?? 0;
          objective.setScore(key, current + (op.value ?? 0));
          break;
        case "set":
          objective.setScore(key, op.value ?? 0);
          break;
        case "remove":
          const balance = objective.getScore(key) ?? 0;
          objective.setScore(key, Math.max(0, balance - (op.value ?? 0)));
          break;
      }
    } catch (e) {
      console.warn("[DB] batchOperations error:", key, e);
    }
  }
}
