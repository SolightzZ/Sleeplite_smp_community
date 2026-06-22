import { MagnetConfig, MagnetText } from '../config.js';
import { addMagnetUser, countMagnetUsers, hasMagnetUser, removeMagnetUser } from './state.js';
import { addSound } from '../../../plugin/utils.js';

export const canUseMagnet = (player) =>
   player && player.isValid && player.location && player.dimension;

export const toggleMagnet = (player, turnOn) => {
   if (!canUseMagnet(player)) return;
   const id = player.id;

   if (turnOn) {
      if (countMagnetUsers() >= MagnetConfig.MAX_USERS && !hasMagnetUser(id)) {
         player.onScreenDisplay?.setActionBar(`§c${MagnetText.FULL}`);
         addSound(player, 'block.false_permissions');
         return;
      }

      addMagnetUser(player);
      player.onScreenDisplay?.setActionBar(`${MagnetText.ON}`);
      addSound(player, 'respawn_anchor.set_spawn');
   } else {
      removeMagnetUser(id);
      player.onScreenDisplay?.setActionBar(`${MagnetText.OFF}`);
      addSound(player, 'respawn_anchor.deplete');
   }
};
