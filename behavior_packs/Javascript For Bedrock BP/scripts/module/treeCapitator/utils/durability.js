import { ItemComponentTypes, EnchantmentTypes } from "@minecraft/server";
import { getPlayerAxe } from "./inventory.js";

export const applyDurabilityDamage = (player, amount) => {
  if (amount <= 0) return;

  const item = getPlayerAxe(player);
  if (!item) return;

  const dur = item.getComponent(ItemComponentTypes.Durability);
  if (!dur) return;

  const enchantable = item.getComponent(ItemComponentTypes.Enchantable);
  const unbreakingLevel = enchantable?.getEnchantment("unbreaking")?.level ?? 0;

  let actualDamage = 0;
  for (let i = 0; i < amount; i++) {
    if (Math.random() * 100 <= 100 / (unbreakingLevel + 1)) {
      actualDamage++;
    }
  }

  if (actualDamage <= 0) return;

  const newDamage = dur.damage + actualDamage;
  dur.damage = Math.min(newDamage, dur.maxDurability);

  const inv = player.getComponent("minecraft:inventory");
  if (!inv?.container) return;

  if (dur.damage >= dur.maxDurability) {
    inv.container.setItem(player.selectedSlotIndex, undefined);
    try { player.dimension.playSound("random.break", player.location); } catch { }
  } else {
    inv.container.setItem(player.selectedSlotIndex, item);
  }
};
