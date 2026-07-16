import { logError } from '../../../events/logger.js';
import { Registry } from '../../../events/registry.js';
import { pcheck } from './../../../shared/player.js';
import { pullItemsToPlayer } from './puller.js';
import { countMagnetUsers, getMagnetUserIds, removeMagnetUser } from './state.js';

export const magnetTick = () => {
   try {
      if (countMagnetUsers() === 0) return;

      const ids = [...getMagnetUserIds()];
      const toRemove = [];

      for (let i = 0; i < ids.length; i++) {
         const playerId = ids[i];
         const entry = Registry.get(playerId);
         const player = entry?.player;

         if (player && pcheck(player)) {
            pullItemsToPlayer(player);
         } else if (entry) {
            toRemove.push(playerId);
         }
      }

      for (const playerId of toRemove) {
         removeMagnetUser(playerId);
      }
   } catch (error) {
      logError('Magnet', 'Loop Error', error);
   }
};
