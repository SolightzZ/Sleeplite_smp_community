import { Durability } from '../../../shared/durability.js';

export const applyDurabilityDamage = (player, item, amt, unbreakLevel) =>
  Durability.applyDurabilityDamage(player, item, amt, unbreakLevel);
