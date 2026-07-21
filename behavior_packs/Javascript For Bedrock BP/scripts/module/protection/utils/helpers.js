import { cache } from '../../../shared/cache.js';
import { Config, edgeOffsets } from '../config.js';

const BORDER_CACHE_MAX = 100;
const borderPointCache = new Map();

export const buildBorderPoints = (start, step) => {
   const cacheKey = `${start.x},${start.y},${start.z},${step}`;
   const cachedResult = borderPointCache.get(cacheKey);
   if (cachedResult) return cachedResult;

   const points = [];

   for (const offset of edgeOffsets) {
      const axis = offset[0];
      const offsetX = offset[1];
      const offsetY = offset[2];
      const offsetZ = offset[3];

      for (let stepDistance = 0; stepDistance <= Config.ZoneSize; stepDistance += step) {
         const point = {
            x: start.x + offsetX,
            y: start.y + offsetY,
            z: start.z + offsetZ,
         };
         if (axis === 'x') point.x += stepDistance;
         if (axis === 'y') point.y += stepDistance;
         if (axis === 'z') point.z += stepDistance;
         points.push({ x: point.x + 0.5, y: point.y + 0.5, z: point.z + 0.5 });
      }
   }

   if (borderPointCache.size >= BORDER_CACHE_MAX) borderPointCache.clear();
   borderPointCache.set(cacheKey, points);
   return points;
};

// ตัวช่วยบล็อก / ช่องเก็บของ
const CONTAINER_BLOCK_TYPES = new Set([
   'minecraft:chest',
   'minecraft:trapped_chest',
   'minecraft:barrel',
   'minecraft:furnace',
   'minecraft:blast_furnace',
   'minecraft:smoker',
   'minecraft:hopper',
   'minecraft:dropper',
   'minecraft:dispenser',
   'minecraft:brewing_stand',
   'minecraft:shulker_box',
   'minecraft:undyed_shulker_box',
]);

export const isContainerBlock = (typeId) => CONTAINER_BLOCK_TYPES.has(typeId);

export const consumeBlock = (player) => {
   const container = cache.getInventory(player);
   if (!container) return false;

   const items = cache.getContainerItems(container);
   for (let slotIndex = 0; slotIndex < items.length; slotIndex++) {
      const item = items[slotIndex];

      if (item && item.typeId === Config.RequiredBlock) {
         if (item.amount > 1) {
            container.setItem(slotIndex, cache.createItemStack(Config.RequiredBlock, item.amount - 1));
         } else {
            container.setItem(slotIndex, undefined);
         }
         return true;
      }
   }
   return false;
};

// ตัวช่วยเอนทิตี
export const isPlayer = (entity) => entity?.typeId?.startsWith('minecraft:player');

// ตรวจสอบฟอร์ม
export const isFormValid = (player, response) => {
   if (response.canceled) return false;

   const hasFormValues = 'formValues' in response;
   const formValuesAreValid = response.formValues && Array.isArray(response.formValues);
   if (hasFormValues && !formValuesAreValid) {
      cache.sendMessage(player, `[x] ฟอร์มไม่ถูกต้อง กรุณาลองใหม่`);
      return false;
   }
   return true;
};
