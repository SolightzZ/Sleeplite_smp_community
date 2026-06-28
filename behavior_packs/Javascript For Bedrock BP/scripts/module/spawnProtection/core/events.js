import { logError } from '../../../events/logger.js';
import { inSpawnZoneSpawnProtec, canSpawnProtec } from './protection.js';

export class EventSpawnProtec {
   static edit(flag) {
      return (event) => {
         try {
            const { block, player } = event;
            if (event.cancel) return;
            if (!inSpawnZoneSpawnProtec(block.location, block.dimension.id))
               return;
            if (!canSpawnProtec(flag, player)) event.cancel = true;
         } catch (error) {
            logError('SpawnProtec', 'EventSpawnProtec.edit', error);
         }
      };
   }

   static interact(event) {
      try {
         const { block, player } = event;
         if (event.cancel) return;
         if (!inSpawnZoneSpawnProtec(block.location, block.dimension.id))
            return;
         if (!canSpawnProtec('container', player)) event.cancel = true;
      } catch (error) {
         logError('SpawnProtec', 'EventSpawnProtec.interact', error);
      }
   }

   static explosion(event) {
      try {
         const { dimension, source } = event;
         const center = source?.location;
         if (!center) {
            if (dimension.id === 'minecraft:overworld') event.cancel = true;
            return;
         }
         if (!inSpawnZoneSpawnProtec(center, dimension.id)) return;
         if (!canSpawnProtec('explosion')) event.cancel = true;
      } catch (error) {
         logError('SpawnProtec', 'EventSpawnProtec.explosion', error);
      }
   }
}
