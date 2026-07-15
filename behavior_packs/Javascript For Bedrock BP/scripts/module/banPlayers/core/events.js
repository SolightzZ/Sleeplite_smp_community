import { system } from '@minecraft/server';
import { checkBanOnJoin } from './ban.js';
import { logError } from '../../../events/logger.js';
import { pcheck } from './../../../shared/player.js';

export const onPlayerJoinCheckBan = (event) => {
   try {
      const player = event.player;
      if (!pcheck(player)) return;

      system.run(() => {
         try {
            if (!pcheck(player)) return;
            checkBanOnJoin(player);
         } catch (error) {
            logError('BanEvents', `join check error for ${player.name}`, error);
         }
      });
   } catch (error) {
      logError('BanEvents', 'onPlayerJoinCheckBan error', error);
   }
};
