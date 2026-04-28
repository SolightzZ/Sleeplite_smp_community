import { EnchantmentTypes } from "@minecraft/server";

const getProtectionBonus = (enchants) => {
  const protectionType = EnchantmentTypes.get("protection");
  let bonus = 0;
  const details = [];

  if (protectionType) {
    const level = enchants?.find((e) => e.type.id === protectionType.id)?.level || 0;
    if (level > 0 && level <= protectionType.maxLevel) {
      bonus = level * 4;
      details.push(`Protection: ${bonus}%`);
    }
  }

  return {
    protectionBonus: Math.min(20, bonus),
    details,
  };
};

const getBreachReduction = (enchants) => {
  const breachLevel = enchants?.find((e) => e.type.id === "breach")?.level || 0;
  return breachLevel * 15;
};

export const getDamageReduction = (armor, toughness, enchants, damage) => {
  const baseReduction = Math.min(20, Math.max(armor / 5, armor - (4 * damage) / (Math.min(toughness, 20) + 8))) / 25;
  const { protectionBonus, details } = getProtectionBonus(enchants);
  const breachReduction = getBreachReduction(enchants);
  const total = Math.max(0, Math.min(80, baseReduction * 100 + protectionBonus - breachReduction));

  return {
    total,
    base: baseReduction * 100,
    protectionBonus,
    breachReduction,
    details,
  };
};
