import { EquipmentSlot, ItemComponentTypes } from "@minecraft/server";

export const applyDurabilityDamage = (player, item, amount, unbreakingLevel) => {
  if (amount <= 0 || !item) return;
  const dur = item.getComponent(ItemComponentTypes.Durability);
  if (!dur || dur.unbreakable) return;

  let actualDamage = 0;
  for (let i = 0; i < amount; i++) {
    if (Math.random() * 100 <= 100 / (unbreakingLevel + 1)) {
      actualDamage++;
    }
  }

  if (actualDamage <= 0) return;

  dur.damage += actualDamage;
  const equip = player.getComponent("minecraft:equippable");
  if (dur.damage >= dur.maxDurability) {
    equip.setEquipment(EquipmentSlot.Mainhand, undefined);
    player.dimension.playSound("random.break", player.location);
  } else {
    equip.setEquipment(EquipmentSlot.Mainhand, item);
  }
};
