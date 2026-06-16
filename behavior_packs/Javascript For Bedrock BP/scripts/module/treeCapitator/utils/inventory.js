import { EntityComponentTypes } from "@minecraft/server";

export const getPlayerAxe = (player) => {
  if (!player || !player.isValid) return undefined;

  const inv = player.getComponent(EntityComponentTypes.Inventory);
  if (!inv || !inv.container) return undefined;

  const item = inv.container.getItem(player.selectedSlotIndex);
  if (!item) return undefined;

  const typeId = item.typeId;
  if (!typeId.includes("axe") || typeId.includes("pickaxe")) return undefined;

  return item;
};

