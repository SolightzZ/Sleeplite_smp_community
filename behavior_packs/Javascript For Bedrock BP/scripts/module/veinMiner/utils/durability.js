import { EquipmentSlot, ItemComponentTypes } from "@minecraft/server";

export const applyDurabilityDamage = (player, item, amount, unbreakingLevel) => {
  if (amount <= 0 || !item) return;
  const dur = item.getComponent(ItemComponentTypes.Durability);
  if (!dur) return;

  let actualDamage = 0;
  for (let i = 0; i < amount; i++) {
    if (Math.random() * 100 <= 100 / (unbreakingLevel + 1)) {
      actualDamage++;
    }
  }

  if (actualDamage <= 0) return;

  const newDamage = dur.damage + actualDamage;
  dur.damage = Math.min(newDamage, dur.maxDurability);

  const equip = player.getComponent("minecraft:equippable");
  if (!equip) return;

  if (dur.damage >= dur.maxDurability) {
    equip.setEquipment(EquipmentSlot.Mainhand, undefined);
    try { player.dimension.playSound("random.break", player.location); } catch { }
  } else {
    equip.setEquipment(EquipmentSlot.Mainhand, item);
  }
};
