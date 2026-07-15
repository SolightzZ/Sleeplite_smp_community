import { getPlayerAxe } from './inventory.js';
import { getEnchantLevel } from '../../../shared/enchant.js';
import { Durability } from '../../../shared/durability.js';

export const applyDurabilityDamage = (player, amount) => {
  const axe = getPlayerAxe(player);
  if (!axe) return;
  const unbreakLevel = getEnchantLevel(axe, 'unbreaking');
  Durability.applyDurabilityDamage(player, axe, amount, unbreakLevel);
};
