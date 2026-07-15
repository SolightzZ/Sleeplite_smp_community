import { getHeldItem } from '../../../shared/player.js';

export const getPlayerAxe = (player) => {
  const item = getHeldItem(player);
  const typeId = item?.typeId;
  if (!typeId || !typeId.includes("axe") || typeId.includes("pickaxe")) return undefined;

  return item;
};

