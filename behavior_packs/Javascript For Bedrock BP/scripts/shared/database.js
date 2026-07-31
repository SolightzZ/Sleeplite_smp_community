import { cache } from './cache.js';

const _parse = (raw, fallback) => {
   if (!raw) return fallback;
   try {
      return JSON.parse(raw);
   } catch {
      return fallback;
   }
};

export class Database {
   static loadGlobal(key, fallback = {}) {
      return _parse(cache.getDynamicProperty(key), fallback);
   }

   static saveGlobal(key, value) {
      return cache.setDynamicProperty(key, JSON.stringify(value));
   }

   static loadPlayer(player, key, fallback = {}) {
      return _parse(cache.getPlayerDynamicProperty(player, key), fallback);
   }
}
