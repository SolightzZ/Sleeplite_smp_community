import { nowUnix } from '../../../shared/datetime.js';

const _banCache = new Map();

export const BanState = {
   rebuildCache(data) {
      _banCache.clear();
      const now = nowUnix();
      for (const [name, entry] of Object.entries(data)) {
         if (entry.duration === 0 || entry.expiresAt > now) {
            _banCache.set(name, entry);
         }
      }
   },

   getAllBans() {
      return Array.from(_banCache.entries()).map(([name, entry]) => ({
         name,
         ...entry,
      }));
   },

};
