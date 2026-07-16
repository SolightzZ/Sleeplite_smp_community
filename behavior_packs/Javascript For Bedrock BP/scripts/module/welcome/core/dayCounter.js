import { cache } from '../../../shared/cache.js';
import { CFG } from '../config.js';
import { thaiDateKey, parseThaiDateKey } from '../../../shared/datetime.js';

export const getPlayerDayNumber = (player) => {
   const key = cache.getPlayerDynamicProperty(player, CFG.dayStorageKey);

   if (!key) {
      const today = thaiDateKey();
      cache.setPlayerDynamicProperty(player, CFG.dayStorageKey, today);
      return 1;
   }

   const today = parseThaiDateKey(thaiDateKey());
   const first = parseThaiDateKey(key);
   return Math.floor((today - first) / 86400000) + 1;
};
