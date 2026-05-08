import { ItemComponentTypes } from "@minecraft/server";
import { getPlayerAxe } from "./inventory";

export const applyDurabilityDamage = (player, amount) => {
  if (amount <= 0) return;

  const item = getPlayerAxe(player);
  if (!item) return;

  const dur = item.getComponent(ItemComponentTypes.Durability);
  if (!dur || dur.unbreakable) return;

  const unbreakingLevel = item.getComponent("minecraft:enchantable")?.getEnchantment("unbreaking")?.level ?? 0;

  let actualDamage = 0;
  for (let i = 0; i < amount; i++) {
    if (Math.random() * 100 <= 100 / (unbreakingLevel + 1)) {
      actualDamage++;
    }
  }

  if (actualDamage <= 0) return;

  dur.damage += actualDamage;

  const inv = player.getComponent("minecraft:inventory");
  if (dur.damage >= dur.maxDurability) {
    inv.container.setItem(player.selectedSlotIndex, undefined);
    player.dimension.playSound("random.break", player.location);
  } else {
    inv.container.setItem(player.selectedSlotIndex, item);
  }
};
