import { system } from '@minecraft/server';
import { cache } from '../../shared/cache.js';
import { pcheck } from './../../shared/player.js';
import { addSound } from '../../shared/utils.js';

export const see = (player, thing) => {
   if (!pcheck(player)) return false;

   const bag = cache.getInventory(player);
   if (!bag) return false;

   const items = cache.getContainerItems(bag);
   for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item && item.typeId === thing) return true;
   }

   return false;
};

export const eat = (player, thing) => {
   if (!pcheck(player)) return;

   system.run(() => {
      if (!pcheck(player)) return;

      const bag = cache.getInventory(player);
      if (!bag) return;

      const items = cache.getContainerItems(bag);
      for (let i = 0; i < items.length; i++) {
         const item = items[i];
         if (item && item.typeId === thing) {
            if (item.amount > 1) {
               item.amount--;
               bag.setItem(i, item);
            } else {
               bag.setItem(i, undefined);
            }
            break;
         }
      }
   });
};

export const hit = (player, pain) => {
   if (!pcheck(player) || pain <= 0) return;

   system.run(() => {
      if (pcheck(player)) player.applyDamage(pain);
   });
};

export const say = (player, message) => {
   if (!pcheck(player)) return;

   system.run(() => {
      if (!pcheck(player)) return;
      cache.setActionBar(player.onScreenDisplay, message);
   });
};

export const sound = (player, soundId, options) => {
   if (!pcheck(player)) return;

   system.run(() => {
      if (pcheck(player)) addSound(player, soundId, options);
   });
};
