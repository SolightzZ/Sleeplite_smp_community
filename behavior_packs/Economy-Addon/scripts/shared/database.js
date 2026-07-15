import { cache } from './cache.js';

function _parse(raw, fallback) {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export const loadGlobal = (key, fallback = {}) =>
  _parse(cache.getDynamicProperty(key), fallback);

export const saveGlobal = (key, value) =>
  cache.setDynamicProperty(key, JSON.stringify(value));

export const loadPlayer = (player, key, fallback = {}) =>
  _parse(cache.getPlayerDynamicProperty(player, key), fallback);

export const savePlayer = (player, key, value) =>
  cache.setPlayerDynamicProperty(player, key, JSON.stringify(value));
