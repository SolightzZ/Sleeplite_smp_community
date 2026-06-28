import { ItemStack, world } from '@minecraft/server';

import { CONFIG } from '../config.js';

export function getChestKey(block) {
   const { x, y, z } = block.location;
   return `${block.dimension.id}|${x}|${y}|${z}`;
}

const CHEST_DIRECTIONS = [
   { x: 0, z: -1 },
   { x: 0, z: 1 },
   { x: -1, z: 0 },
   { x: 1, z: 0 },
];

export function findDoubleChestPartner(block) {
   if (block.typeId !== CONFIG.CHEST_ID) return null;
   const dim = block.dimension;
   const { x, y, z } = block.location;
   for (const dir of CHEST_DIRECTIONS) {
      const target = dim.getBlock({ x: x + dir.x, y, z: z + dir.z });
      if (target && target.typeId === CONFIG.CHEST_ID) {
         const inv = target.getComponent('inventory');
         if (inv && inv.container.size === 54) {
            return target;
         }
      }
   }
   return null;
}

export function findItemInChest(block) {
   const inv = block.getComponent('inventory');
   if (!inv) return null;

   const container = inv.container;
   const counts = new Map();

   for (let i = 0, len = container.size; i < len; i++) {
      const item = container.getItem(i);
      if (!item) continue;
      if (item.typeId === CONFIG.DIAMOND_ID) continue;

      const existing = counts.get(item.typeId);
      if (existing) {
         existing.amount += item.amount;
      } else {
         const enchComp = item.getComponent('enchantable');
         const enchantments = [];
         if (enchComp) {
            for (const e of enchComp.getEnchantments()) {
               enchantments.push({ id: e.type.id, level: e.level });
            }
         }
         counts.set(item.typeId, {
            typeId: item.typeId,
            amount: item.amount,
            enchantments: enchantments.length > 0 ? enchantments : undefined,
         });
      }
   }

   let best = null;
   for (const entry of counts.values()) {
      if (entry.amount < CONFIG.ITEMS_PER_SLOT) continue;
      if (!best || entry.amount > best.amount) {
         best = entry;
      }
   }

   return best;
}

export function findItemInContainer(container) {
   const counts = new Map();
   for (let i = 0, len = container.size; i < len; i++) {
      const item = container.getItem(i);
      if (!item) continue;
      if (item.typeId === CONFIG.DIAMOND_ID) continue;
      counts.set(item.typeId, (counts.get(item.typeId) ?? 0) + item.amount);
   }
   let best = null;
   let bestType = null;
   for (const [typeId, amount] of counts) {
      if (amount < CONFIG.ITEMS_PER_SLOT) continue;
      if (!best || amount > best) {
         best = amount;
         bestType = typeId;
      }
   }
   return bestType;
}

export function getPlayerContainer(player) {
   return player.getComponent('inventory')?.container ?? null;
}

export function getChestContainer(loc) {
   try {
      const dim = world.getDimension(loc.dim);
      const block = dim.getBlock({ x: loc.x, y: loc.y, z: loc.z });
      const chest = block?.getComponent('inventory');
      return chest?.container ?? null;
   } catch {
      return null;
   }
}

export function removeItemsFromContainer(container, itemId, amountToRemove) {
   for (let i = 0, len = container.size; i < len && amountToRemove > 0; i++) {
      const s = container.getItem(i);
      if (!s || s.typeId !== itemId) continue;
      const take = Math.min(s.amount, amountToRemove);
      if (take >= s.amount) {
         container.setItem(i, undefined);
      } else {
         s.amount -= take;
         container.setItem(i, s);
      }
      amountToRemove -= take;
   }
}

// ไอเทมที่วางพื้นอาจหายหรือมีคนอื่นเก็บไป
export function giveItemsToPlayer(target, itemId, amount, fallbackContainer, player, onOverflowMsg) {
   const maxStack = CONFIG.DEFAULT_MAX_STACK;
   let remaining = amount;
   while (remaining > 0) {
      const give = Math.min(remaining, maxStack);
      const stack = new ItemStack(itemId, give);
      const remainder = target.addItem(stack);
      if (remainder) {
         const leftover = fallbackContainer.addItem(remainder);
         if (leftover) {
            player.dimension.spawnItem(leftover, player.location);
         }
         if (onOverflowMsg) player.sendMessage(onOverflowMsg);
         break;
      }
      remaining -= give;
   }
}

export function formatItemName(typeId) {
   const raw = typeId.replace(/^minecraft:/, '');
   return raw
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
}
