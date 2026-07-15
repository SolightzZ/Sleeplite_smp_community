import { BlockPermutation } from '@minecraft/server';
import { logError } from '../events/logger.js';
import { cache } from '../shared/cache.js';
import { pcheck } from './../shared/player.js';

const SPONGE = 'minecraft:sponge';
const WATER = 'minecraft:water';
const MAX_DISTANCE = 6;

const findSpongeSlot = (items) => {
   for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item && item.typeId === SPONGE) return i;
   }

   return -1;
};

const getSpongeSlot = (player, container) => {
   const items = cache.getContainerItems(container);
   const selectedSlot = player.selectedSlotIndex;

   if (selectedSlot >= 0 && selectedSlot < items.length) {
      const selectedItem = items[selectedSlot];

      if (selectedItem && selectedItem.typeId === SPONGE) return selectedSlot;
   }

   return findSpongeSlot(items);
};

const getTargetWaterBlock = (player) => {
   const hit = player.getBlockFromViewDirection({
      maxDistance: MAX_DISTANCE,
      includeLiquidBlocks: true,
      includePassableBlocks: true,
   });

   if (!hit || !hit.block || !hit.block.isValid) return undefined;
   if (hit.block.typeId !== WATER) return undefined;
   return hit.block;
};

const consumeSponge = (container, slot) => {
   const item = cache.getContainerItems(container)[slot];
   if (!item || item.typeId !== SPONGE) return false;
   if (item.amount > 1) {
      item.amount--;
      container.setItem(slot, item);
      return true;
   }

   container.setItem(slot, undefined);
   return true;
};

let _spongePermutation;
const getSpongePerm = () => _spongePermutation || (_spongePermutation = BlockPermutation.resolve(SPONGE));

const absorbWaterWithSponge = (container, slot, block) => {
   if (!consumeSponge(container, slot)) return;
   block.setPermutation(getSpongePerm());
};

export const handleSpongeAbsorption = (event) => {
   try {
      const item = event.itemStack;
      if (!item || item.typeId !== SPONGE) return;

      const player = event.source;
      if (!pcheck(player)) return;

      const container = cache.getInventory(player);
      if (!container) return;

      const slot = getSpongeSlot(player, container);
      if (slot === -1) return;

      const waterBlock = getTargetWaterBlock(player);
      if (!waterBlock) return;

      if (!pcheck(player) || !waterBlock.isValid) return;
      absorbWaterWithSponge(container, slot, waterBlock);
   } catch (error) {
      logError('SpongeAbsorption', 'handleSpongeAbsorption', error);
   }
};
