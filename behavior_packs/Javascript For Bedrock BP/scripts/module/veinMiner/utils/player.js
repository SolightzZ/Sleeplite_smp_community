import { EquipmentSlot } from "@minecraft/server";
import { PICKAXE_BREAKS } from "../data/ores.js";

export const getPlayerPickaxe = (player) => {
  const equip = player.getComponent("minecraft:equippable");
  if (!equip) return undefined;
  const item = equip.getEquipment(EquipmentSlot.Mainhand);
  if (!item || !PICKAXE_BREAKS[item.typeId]) return undefined;
  return item;
};
