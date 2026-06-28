import { CONFIG } from '../config.js';
import { getByLocation, makeLocKey } from './database.js';

export function isProtectedShopChest(block) {
   if (block.typeId !== CONFIG.CHEST_ID) return null;
   const { x, y, z } = block.location;
   const locKey = makeLocKey(block.dimension.id, x, y, z);
   return getByLocation(locKey);
}

export function isOwner(playerName, record) {
   return record.name?.player === playerName;
}
