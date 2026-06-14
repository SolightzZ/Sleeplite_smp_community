import { ItemComponentTypes, EntityComponentTypes } from "@minecraft/server";
import { getPlayerAxe } from "./inventory.js";

export const applyDurabilityDamage = (player, amount) => {
  if (amount <= 0) return;

  const item = getPlayerAxe(player);
  if (!item) return;

  const dur = item.getComponent(ItemComponentTypes.Durability);
  if (!dur) return;

  const enchant = item.getComponent(ItemComponentTypes.Enchantable);
  const unbreakLevel = enchant?.getEnchantment("unbreaking")?.level || 0;

  let actual = 0;
  for (let iteration = 0; iteration < amount; iteration++) {
    if (Math.random() * 100 <= 100 / (unbreakLevel + 1)) {
      actual++;
    }
  }

  if (actual <= 0) return;

  dur.damage = Math.min(dur.damage + actual, dur.maxDurability);

  const inv = player.getComponent(EntityComponentTypes.Inventory);
  if (!inv || !inv.container) return;

  if (dur.damage >= dur.maxDurability) {
    inv.container.setItem(player.selectedSlotIndex, undefined);
    player.dimension.playSound("random.break", player.location);
  } else {
    inv.container.setItem(player.selectedSlotIndex, item);
  }
};
