export const getPlayerAxe = (player) => {
  const inv = player.getComponent("minecraft:inventory");
  if (!inv?.container) return undefined;
  const item = inv.container.getItem(player.selectedSlotIndex);
  if (!item || !item.typeId.includes("axe")) return undefined;
  return item;
};
