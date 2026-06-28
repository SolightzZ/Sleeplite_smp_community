import { logError } from '../../../events/logger.js';
import { ITEM_ENTITY, MAX_ITEM_RADIUS } from '../config.js';

export const findNearbyItems = (dimension, location) => {
   return dimension.getEntities({
      location,
      type: ITEM_ENTITY,
      maxDistance: MAX_ITEM_RADIUS,
   });
};

export const safeAddItem = (container, itemStack) => {
   if (container.emptySlotsCount <= 0) return false;
   try {
      container.addItem(itemStack);
      return true;
   } catch (error) {
      logError('Gravestone', 'Error adding item', error);
      return false;
   }
};
