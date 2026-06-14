import { EquipmentSlot, ItemComponentTypes, EntityComponentTypes } from "@minecraft/server";

export const applyDurabilityDamage = (player, item, amt, unbreakLevel) => {
  if (amt <= 0 || !item) return;

  const dur = item.getComponent(ItemComponentTypes.Durability);
  if (!dur) return;

  let actual = 0;
  for (let iteration = 0; iteration < amt; iteration++) {
    if (Math.random() * 100 <= 100 / (unbreakLevel + 1)) {
      actual++;
    }
  }

  if (actual <= 0) return;

  dur.damage = Math.min(dur.damage + actual, dur.maxDurability);

  const equip = player.getComponent(EntityComponentTypes.Equippable);
  if (!equip) return;

  if (dur.damage >= dur.maxDurability) {
    equip.setEquipment(EquipmentSlot.Mainhand, undefined);
    player.dimension.playSound("random.break", player.location);
  } else {
    equip.setEquipment(EquipmentSlot.Mainhand, item);
  }
};
