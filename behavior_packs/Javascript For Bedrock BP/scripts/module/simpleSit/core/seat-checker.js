import { EntityComponentTypes } from '@minecraft/server';

import { logError } from '../../../router/core/logger.js';
import { isRemovedBlock } from '../utils/block.js';
import { seatHasMoved } from '../utils/location.js';
import { activeSeats } from './seat-manager.js';

const WATER = 'minecraft:water';
const FLOWING_WATER = 'minecraft:flowing_water';

export const checkSeats = () => {
   for (const [seatId, data] of activeSeats) {
      const entity = data.seatEntity;
      const dim = data.dimension;
      const spawnLoc = data.spawnLocation;
      const blockLoc = data.blockLocation;

      if (!entity || !entity.isValid) {
         activeSeats.delete(seatId);
         continue;
      }

      let blockRemoved = false;
      if (blockLoc) {
         try {
            const block = dim.getBlock(blockLoc);
            blockRemoved = block ? isRemovedBlock(block.typeId) : true;
         } catch (error) {
            blockRemoved = true;
            logError('simpleSit', 'block', error);
         }
      } else {
         const underLoc = {
            x: Math.floor(entity.location.x),
            y: Math.floor(entity.location.y) - 1,
            z: Math.floor(entity.location.z),
         };
         try {
            const underBlock = dim.getBlock(underLoc);
            blockRemoved = underBlock ? isRemovedBlock(underBlock.typeId) : true;
         } catch (error) {
            blockRemoved = true;
            logError('simpleSit', 'underBlock', error);
         }
      }

      let inWater = false;
      try {
         const seatBlock = dim.getBlock(entity.location);
         inWater = seatBlock?.typeId === WATER || seatBlock?.typeId === FLOWING_WATER;
      } catch (error) {
         inWater = true;
         logError('simpleSit', 'seatBlock', error);
      }

      const moved = seatHasMoved(entity.location, spawnLoc);

      const rideable = entity.getComponent(EntityComponentTypes.Rideable);
      let hasRider = false;
      if (rideable) {
         const riders = rideable.getRiders();
         hasRider = riders.length > 0;
      }

      if (blockRemoved || inWater || moved || !hasRider) {
         try {
            entity.remove();
         } catch (error) {
            logError('simpleSit', 'entity.remove', error);
         }

         activeSeats.delete(seatId);
      }
   }
};
