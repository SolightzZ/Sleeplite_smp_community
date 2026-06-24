import { EntityComponentTypes, ItemStack } from '@minecraft/server';

import { logError } from '../../router/core/logger.js';
import { config } from './constants.js';

function time() {
   const now = new Date();
   const day = String(now.getDate()).padStart(2, '0');
   const month = String(now.getMonth() + 1).padStart(2, '0');
   const year = now.getFullYear();
   return `${day}/${month}/${year}`;
}

function name(id) {
   let text = id.split(':')[1] || id;
   return text.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function give(player, id, count) {
   try {
      if (!player || !player.isValid) return false;

      const inventory = player.getComponent(EntityComponentTypes.Inventory);
      if (!inventory?.container) return false;

      const container = inventory.container;
      const slotIndices = Array.from({ length: container.size }, (_, i) => i);
      const amountToAdd = player.hasTag(config.vipTag) ? count * config.vipMul : count;
      const maxStack = new ItemStack(id, 1).maxAmount;

      let remaining = amountToAdd;

      for (const index of slotIndices) {
         if (remaining <= 0) break;
         const slotItem = container.getItem(index);
         if (slotItem?.typeId === id && slotItem.amount < maxStack) {
            const toAdd = Math.min(remaining, maxStack - slotItem.amount);
            slotItem.amount += toAdd;
            container.setItem(index, slotItem);
            remaining -= toAdd;
         }
      }

      for (const index of slotIndices) {
         if (remaining <= 0) break;
         const slotItem = container.getItem(index);
         if (!slotItem) {
            const toAdd = Math.min(remaining, maxStack);
            container.setItem(index, new ItemStack(id, toAdd));
            remaining -= toAdd;
         }
      }

      if (remaining > 0) {
         console.warn(`[Give] Not enough space. ${remaining} items could not be given.`);
      }

      return remaining < amountToAdd;
   } catch (error) {
      logError('Give', 'Error', error);
      return false;
   }
}

export { give, name, time };
