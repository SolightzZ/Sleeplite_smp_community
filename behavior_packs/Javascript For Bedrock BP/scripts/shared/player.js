import { EquipmentSlot } from '@minecraft/server';
import { cache } from './cache.js';

export const pcheck = (player) => !!(player && player.isValid);

export const pisPlayer = (player) => !!(player && player.typeId === 'minecraft:player' && player.isValid);

export const getHeldItem = (player) => {
   if (!pcheck(player)) return undefined;
   const equip = cache.getEquippable(player);
   if (!equip) return undefined;
   return equip.getEquipment(EquipmentSlot.Mainhand);
};
