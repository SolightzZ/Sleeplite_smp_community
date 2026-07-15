import { EquipmentSlot } from '@minecraft/server';
import { cache } from './cache.js';

export class Durability {
   static applyDurabilityDamage(player, item, amount, unbreakLevel = 0) {
      if (amount <= 0 || !item) return;

      const dur = cache.getDurability(item);
      if (!dur) return;

      let actual = 0;
      for (let iteration = 0; iteration < amount; iteration++) {
         if (Math.random() * 100 <= 100 / (unbreakLevel + 1)) {
            actual++;
         }
      }

      if (actual <= 0) return;

      dur.damage = Math.min(dur.damage + actual, dur.maxDurability);

      const equip = cache.getEquippable(player);
      if (!equip) return;

      if (dur.damage >= dur.maxDurability) {
         equip.setEquipment(EquipmentSlot.Mainhand, undefined);
         player.dimension.playSound('random.break', player.location);
      } else {
         equip.setEquipment(EquipmentSlot.Mainhand, item);
      }
   }
}
