import { logError } from '../../events/logger.js';
import { cache } from '../../shared/cache.js';
import { pcheck } from '../../shared/player.js';
import { PlayerTimeStorage } from './PlayerTimeStorage.js';

class PlayerTimeManager {
   onJoin(player) {
      const now = Date.now();

      if (!PlayerTimeStorage.getFirstJoin(player)) {
         PlayerTimeStorage.setFirstJoin(player, now);
      }

      PlayerTimeStorage.setLastJoin(player, now);
      PlayerTimeStorage.setLastSeen(player, now);
   }

   onLeave(player) {
      const now = Date.now();
      const join = PlayerTimeStorage.getLastJoin(player) || now;
      const played = Math.max(0, now - join);

      if (played > 0) {
         PlayerTimeStorage.setPlayTime(player, PlayerTimeStorage.getPlayTime(player) + played);
      }

      PlayerTimeStorage.setLastSeen(player, now);
   }

   initOnline() {
      try {
         for (const player of cache.getAllPlayers()) {
            if (pcheck(player)) this.onJoin(player);
         }
      } catch (error) {
         logError('playerTime', 'initOnline', error);
      }
   }
}

export const playerTimeManager = new PlayerTimeManager();
