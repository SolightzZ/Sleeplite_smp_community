import { EnchantmentTypes } from "@minecraft/server";

let _protType = undefined;

const getProtectionBonus = (enchants) => {
  if (!enchants) return { protectionBonus: 0, details: [] };
  if (_protType === undefined) _protType = EnchantmentTypes.get("protection") ?? null;
  if (!_protType) return { protectionBonus: 0, details: [] };
  let level = 0;
  for (let i = 0; i < enchants.length; i++) {
    if (enchants[i].type.id === _protType.id) {
      level = enchants[i].level;
      break;
    }
  }
  if (level <= 0 || level > _protType.maxLevel) {
    return { protectionBonus: 0, details: [] };
  }
  const bonus = Math.min(20, level * 4);
  return { protectionBonus: bonus, details: [`Protection: ${bonus}%`] };
};

const getBreachReduction = (enchants) => {
  if (!enchants) return 0;
  for (let i = 0; i < enchants.length; i++) {
    if (enchants[i].type.id === "breach") return enchants[i].level * 15;
  }
  return 0;
};

export const getDamageReduction = (armor, toughness, enchants, damage) => {
  const baseReduction =
    Math.min(
      20,
      Math.max(armor / 5, armor - (4 * damage) / (Math.min(toughness, 20) + 8)),
    ) / 25;
  const { protectionBonus, details } = getProtectionBonus(enchants);
  const breachReduction = getBreachReduction(enchants);
  const total = Math.max(0, Math.min(80, baseReduction * 100 + protectionBonus - breachReduction));
  return { total, base: baseReduction * 100, protectionBonus, breachReduction, details };
};
