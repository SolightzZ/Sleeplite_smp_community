import { logError } from '../../../events/logger.js';
import { Registry } from '../../../events/registry.js';
import { pcheck } from '../../../shared/player.js';
import { isFlashlightHeld } from './held.js';
import { removeLightBlock } from './player-light.js';
import { activeHolders, playerLights } from './state.js';

export function syncReconcile() {
   try {
      const allPlayers = Registry.getPlayers();

      activeHolders.clear();
      for (const player of allPlayers) {
         if (pcheck(player) && isFlashlightHeld(player)) {
            activeHolders.add(player.id);
         }
      }

      for (const trackedId of [...playerLights.keys()]) {
         if (!activeHolders.has(trackedId)) {
            removeLightBlock(trackedId);
         }
      }
   } catch (error) {
      logError('flashlight', 'syncReconcile', error);
   }
}
