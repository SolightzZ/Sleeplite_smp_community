import { ItemComponentTypes } from '@minecraft/server';
import { cache } from './cache.js';

export const getEnchantData = (item) => {
   const enc = cache.getComponent(item, ItemComponentTypes.Enchantable);
   if (!enc) return { fortune: 0, silk: false, unbreaking: 0 };

   return {
      fortune: enc.getEnchantment('fortune')?.level || 0,
      silk: Boolean(enc.getEnchantment('silk_touch')),
      unbreaking: enc.getEnchantment('unbreaking')?.level || 0,
   };
};

export const getEnchantLevel = (item, name) => cache.getComponent(item, ItemComponentTypes.Enchantable)?.getEnchantment(name)?.level || 0;
