import { MagnetConfig, MagnetText } from '../config.js';
import { addMagnetUser, countMagnetUsers, hasMagnetUser, removeMagnetUser } from './state.js';
import { cache } from '../../../shared/cache.js';
import { pcheck } from '../../../shared/player.js';

export const canUseMagnet = (player) =>
   pcheck(player) && player.location && player.dimension;

export const toggleMagnet = (player, turnOn) => {
   if (!canUseMagnet(player)) return;
   const id = player.id;

   if (turnOn) {
      if (countMagnetUsers() >= MagnetConfig.MAX_USERS && !hasMagnetUser(id)) {
         cache.setActionBar(player.onScreenDisplay, `§c${MagnetText.FULL}`);
         cache.playSound(player, 'block.false_permissions');
         return;
      }

      addMagnetUser(player);
      cache.setActionBar(player.onScreenDisplay, `${MagnetText.ON}`);
      cache.playSound(player, 'respawn_anchor.set_spawn');
   } else {
      removeMagnetUser(id);
      cache.setActionBar(player.onScreenDisplay, `${MagnetText.OFF}`);
      cache.playSound(player, 'respawn_anchor.deplete');
   }
};
