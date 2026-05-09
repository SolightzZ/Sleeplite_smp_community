import { EquipmentSlot, ItemComponentTypes } from "@minecraft/server";

export const applyDurabilityDamage = (player, item, amt, unbreakLevel) => {
  if (amt <= 0 || !item) return;

  const dur = item.getComponent(ItemComponentTypes.Durability);
  if (!dur) return;

  let actual = 0;
  for (let i = 0; i < amt; i++) {
    if (Math.random() * 100 <= 100 / (unbreakLevel + 1)) {
      actual++;
    }
  }

  if (actual <= 0) return;

  dur.damage = Math.min(dur.damage + actual, dur.maxDurability);

  const equip = player.getComponent("minecraft:equippable");
  if (!equip) return;

  if (dur.damage >= dur.maxDurability) {
    equip.setEquipment(EquipmentSlot.Mainhand, undefined);
    try {
      player.dimension.playSound("random.break", player.location);
    } catch {}
  } else {
    equip.setEquipment(EquipmentSlot.Mainhand, item);
  }
};
