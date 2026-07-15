import { EntityComponentTypes, ItemStack } from '@minecraft/server';

import { logError, logWarn } from '../../events/logger.js';
import { config } from './constants.js';
import { cache } from '../../shared/cache.js';
import { pcheck } from './../../shared/player.js';

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
      if (!pcheck(player)) return false;

      const inventory = cache.getInventoryComponent(player);
      if (!inventory?.container) return false;

        const container = inventory.container;
        const items = cache.getContainerItems(container);
        const slotIndices = items.map((_, i) => i);
        const amountToAdd = player.hasTag(config.vipTag) ? count * config.vipMul : count;
        const maxStack = cache.createItemStack(id, 1).maxAmount;

        let remaining = amountToAdd;

        for (const index of slotIndices) {
            if (remaining <= 0) break;
            const slotItem = items[index];
            if (slotItem?.typeId === id && slotItem.amount < maxStack) {
                const toAdd = Math.min(remaining, maxStack - slotItem.amount);
                slotItem.amount += toAdd;
                container.setItem(index, slotItem);
                remaining -= toAdd;
            }
        }

        for (const index of slotIndices) {
            if (remaining <= 0) break;
            const slotItem = items[index];
            if (!slotItem) {
            const toAdd = Math.min(remaining, maxStack);
            container.setItem(index, cache.createItemStack(id, toAdd));
            remaining -= toAdd;
         }
      }

      if (remaining > 0) {
         logWarn('Rewards', `[Give] Not enough space. ${remaining} items could not be given.`);
      }

      return remaining < amountToAdd;
   } catch (error) {
      logError('Give', 'Error', error);
      return false;
   }
}

export { give, name, time };
