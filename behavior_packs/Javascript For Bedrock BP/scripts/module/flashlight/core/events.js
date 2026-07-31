import { logError } from '../../../events/logger.js';
import { pcheck } from '../../../shared/player.js';
import { isFlashlightHeld } from './held.js';
import { removeLightBlock } from './player-light.js';
import { markStale } from './runner.js';
import { activeHolders } from './state.js';

export function flashSpawn(event) {
   try {
      const player = event.player;

      if (!pcheck(player)) return;
      if (isFlashlightHeld(player)) {
         activeHolders.add(player.id);
         markStale();
      }
   } catch (error) {
      logError('flashlight', 'flashSpawn', error);
   }
}

export function flashLeave(playerId) {
   try {
      removeLightBlock(playerId);
      activeHolders.delete(playerId);
      markStale();
   } catch (error) {
      logError('flashlight', 'flashLeave', error);
   }
}
