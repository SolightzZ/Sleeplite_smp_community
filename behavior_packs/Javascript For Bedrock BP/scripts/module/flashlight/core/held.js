import { EquipmentSlot, system } from '@minecraft/server';
import { cache } from '../../../shared/cache.js';
import { FLASHLIGHT_ITEM } from '../config.js';

const _ttlCache = new Map();
const TTL_TICKS = 8;

function pruneCache(currentTick) {
   for (const [key, entry] of _ttlCache) {
      if (currentTick - entry.tick >= TTL_TICKS) _ttlCache.delete(key);
   }
}

export function isFlashlightHeld(player) {
   try {
      const currentTick = system.currentTick;
      const pid = player.id;
      const cached = _ttlCache.get(pid);

      if (cached && currentTick - cached.tick < TTL_TICKS) return cached.result;

      if (_ttlCache.size > 128) pruneCache(currentTick);

      const equippable = cache.getEquippable(player);
      if (!equippable) {
         _ttlCache.set(pid, { result: false, tick: currentTick });
         return false;
      }

      const main = equippable.getEquipment(EquipmentSlot.Mainhand);
      if (main && main.typeId === FLASHLIGHT_ITEM) {
         _ttlCache.set(pid, { result: true, tick: currentTick });
         return true;
      }

      const off = equippable.getEquipment(EquipmentSlot.Offhand);
      const result = !!(off && off.typeId === FLASHLIGHT_ITEM);
      _ttlCache.set(pid, { result, tick: currentTick });

      return result;
   } catch {
      return false;
   }
}
