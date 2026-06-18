import { system } from '@minecraft/server';
import { checkBanOnJoin } from './ban.js';
import { logError } from '../../../router/core/logger.js';

export const onPlayerJoinCheckBan = (event) => {
   try {
      const player = event.player;
      if (!player || !player.isValid) return;

      system.run(() => {
         try {
            if (!player.isValid) return;
            checkBanOnJoin(player);
         } catch (error) {
            logError('BanEvents', `join check error for ${player.name}`, error);
         }
      });
   } catch (error) {
      logError('BanEvents', 'onPlayerJoinCheckBan error', error);
   }
};
