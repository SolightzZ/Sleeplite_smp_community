import { system } from '@minecraft/server';
import { cache } from '../shared/cache.js';
import { addSound } from '../shared/utils.js';

const applyAnvilRepair = (block, permutation, damage, player, item) => {
   system.run(() => {
      let newDamage;

      if (damage === 'very_damaged') newDamage = 'slightly_damaged';
      else if (damage === 'slightly_damaged') newDamage = 'undamaged';
      else return;

      block.setPermutation(permutation.withState('damage', newDamage));

      addSound(player, 'random.anvil_use', {
         volume: 1.0,
         pitch: 1.0,
      });

      const inv = cache.getInventory(player);
      if (!inv) return;

      const slot = player.selectedSlotIndex;
      const amount = item.amount;

      if (amount > 1) {
         inv.setItem(slot, cache.createItemStack(item.typeId, amount - 1));
      } else {
         inv.setItem(slot, undefined);
      }
   });
};

export function handleRepairAnvil(event) {
   const { block, player, itemStack: item } = event;

   if (!item || item.typeId !== 'minecraft:iron_ingot' || player.isSneaking) return;

   const typeId = block.typeId;

   if (typeId !== 'minecraft:chipped_anvil' && typeId !== 'minecraft:damaged_anvil') return;

   const permutation = block.permutation;
   const damage = permutation.getState('damage');

   if (damage === 'undamaged') return;

   event.cancel = true;

   applyAnvilRepair(block, permutation, damage, player, item);
}
