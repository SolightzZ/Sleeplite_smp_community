import { system } from '@minecraft/server';
import { logError } from '../../events/logger.js';
import { Colors } from './database.js';
import { getBiomeIdAtLocation, getBiomeName, getDimensionName } from './functions.js';

function handlePlayerDimensionChange(event) {
   const player = event.player;
   if (!player || player.typeId !== 'minecraft:player' || !player.isValid) return;

   const dimensionId = player.dimension.id;
   const dimensionName = getDimensionName(dimensionId);
   const biomeId = getBiomeIdAtLocation(player);
   const biomeName = getBiomeName(biomeId) || '';

   system.runTimeout(() => {
      if (!player.isValid) return;

      const options = {
         stayDuration: 150,
         fadeInDuration: 10,
         fadeOutDuration: 80,
      };

      if (biomeName) {
         options.subtitle = `${Colors.white}${biomeName}`;
      }

      try {
         player.onScreenDisplay.setTitle(`${Colors.gold}${dimensionName}`, options);
      } catch (error) {
         logError('BiomeType', 'handlePlayerDimensionChange', error);
      }
   }, 60);
}

export { handlePlayerDimensionChange };
