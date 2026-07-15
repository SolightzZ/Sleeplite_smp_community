import { EntityComponentTypes } from '@minecraft/server';
import { logError } from '../../../events/logger.js';
import { cache } from '../../../shared/cache.js';
import { pisPlayer } from './../../../shared/player.js';
import { CENTER_OFFSET, DIMENSION_HEIGHT_RULE, GRAVESTONE_ENTITY, INVENTORY_COMPONENT } from '../config.js';
import { floorPosition, getGraveY } from '../utils/location.js';
import { findNearbyItems, safeAddItem } from './container.js';

export function gravestone_main({ deadEntity: deadPlayer }) {
   if (!pisPlayer(deadPlayer)) return;

   const dimension = deadPlayer.dimension;
   const pos = floorPosition(deadPlayer.location);

   const items = findNearbyItems(dimension, pos);
   if (!items || items.length === 0) return;

   const graveY = getGraveY(dimension.id, pos.y, DIMENSION_HEIGHT_RULE);

   const grave = dimension.spawnEntity(GRAVESTONE_ENTITY, {
      x: pos.x - CENTER_OFFSET,
      y: graveY,
      z: pos.z - CENTER_OFFSET,
   });

   grave.nameTag = `§cGraveStone\n${deadPlayer.nameTag || deadPlayer.name || deadPlayer.id}`;

   const inventory = cache.getComponent(grave, INVENTORY_COMPONENT);
   const container = inventory?.container;
   if (!container) return;

   for (const drop of items) {
      if (!drop.isValid) continue;

      const itemData = cache.getComponent(drop, EntityComponentTypes.Item)?.itemStack;
      if (!itemData) continue;

      const added = safeAddItem(container, itemData);

      if (added) {
         try {
            drop.remove();
         } catch (error) {
            logError('Gravestone', 'Error removing drop', error);
         }
      } else {
         break;
      }
   }
}
