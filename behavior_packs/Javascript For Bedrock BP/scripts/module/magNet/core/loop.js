import { logError } from '../../../events/logger.js';
import { Registry } from '../../../events/registry.js';
import { pcheck } from './../../../shared/player.js';
import { pullItemsToPlayer } from './puller.js';
import { countMagnetUsers, getMagnetUserIds, removeMagnetUser } from './state.js';

export const magnetTick = () => {
   try {
      if (countMagnetUsers() === 0) return;

      const ids = getMagnetUserIds();
      const toRemove = [];

      for (const playerId of ids) {
         const player = Registry.get(playerId)?.player;

         if (pcheck(player)) {
            pullItemsToPlayer(player);
         } else {
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
