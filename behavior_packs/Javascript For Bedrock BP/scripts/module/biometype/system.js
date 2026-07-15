import { system } from '@minecraft/server';
import { logError } from '../../events/logger.js';
import { cache } from '../../shared/cache.js';
import { pcheck, pisPlayer } from './../../shared/player.js';
import { Colors } from './database.js';
import { getBiomeIdAtLocation, getBiomeName, getDimensionName } from './functions.js';

function handlePlayerDimensionChange(event) {
   const player = event.player;
   if (!pisPlayer(player)) return;

   const dimensionId = player.dimension.id;
   const dimensionName = getDimensionName(dimensionId);
   const biomeId = getBiomeIdAtLocation(player);
   const biomeName = getBiomeName(biomeId) || '';

   system.runTimeout(() => {
      if (!pcheck(player)) return;

      const options = {
         stayDuration: 150,
         fadeInDuration: 10,
         fadeOutDuration: 80,
      };

      if (biomeName) {
         options.subtitle = `${Colors.white}${biomeName}`;
      }

      try {
         cache.setTitle(player.onScreenDisplay, `${Colors.gold}${dimensionName}`, options);
      } catch (error) {
         logError('BiomeType', 'handlePlayerDimensionChange', error);
      }
   }, 60);
}

export { handlePlayerDimensionChange };
