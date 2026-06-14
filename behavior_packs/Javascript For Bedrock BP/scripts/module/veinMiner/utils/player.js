import { EquipmentSlot, EntityComponentTypes } from "@minecraft/server";
import { PICKAXE_BREAKS } from "../data/ores.js";

export const getPlayerPickaxe = (player) => {
  if (!player || !player.isValid) return undefined;

  const equip = player.getComponent(EntityComponentTypes.Equippable);
  if (!equip) return undefined;

  const item = equip.getEquipment(EquipmentSlot.Mainhand);
  if (!item || !PICKAXE_BREAKS[item.typeId]) return undefined;

  return item;
};
