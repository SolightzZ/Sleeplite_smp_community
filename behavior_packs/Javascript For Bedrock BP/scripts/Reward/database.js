import { config } from "./constants.js";

export function load(player) {
  try {
    const raw = player.getDynamicProperty(config.dbKey);
    if (!raw) return { last: null, count: 0 };
    return JSON.parse(raw);
  } catch (e) {
    console.warn("load Error: " + e);
    return { last: null, count: 0 };
  }
}

export function save(player, data) {
  try {
    const text = JSON.stringify(data);
    player.setDynamicProperty(config.dbKey, text);
    return true;
  } catch (e) {
    console.warn("Save Error: " + e);
    return false;
  }
}

export function reset(player) {
  console.warn("Reward reset" + config.dbKey);
  player.setDynamicProperty(config.dbKey, undefined);
}
