import { PICKAXE_BREAKS } from "../data/ores.js";
import { getHeldItem } from '../../../shared/player.js';

export const getPlayerPickaxe = (player) => {
  const item = getHeldItem(player);
  if (!item || !PICKAXE_BREAKS[item.typeId]) return undefined;

  return item;
};
