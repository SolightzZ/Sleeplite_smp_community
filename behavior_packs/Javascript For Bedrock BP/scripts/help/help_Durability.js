import { EntityComponentTypes, ItemComponentTypes } from "@minecraft/server";
import { armorData } from "./help_ armorData";
import { getDamageReduction } from "./help_function";

const buildLore = (item, playerTag, stats, enchants, damage) => {
  const durability = item.getComponent(ItemComponentTypes.Durability);
  const currentDurability = durability ? durability.maxDurability - durability.damage : null;
  const maxDurability = durability ? durability.maxDurability : null;

  const lore = [`§8[${playerTag}§8]`];

  if (stats) {
    lore.push(`§r§7Armor: §a+${stats.armor}`);
    if (currentDurability !== null && maxDurability !== null) {
      lore.push(`§r§7Armor Durability: ${currentDurability}/${maxDurability}`);
    }
    if (stats.toughness > 0) {
      lore.push(`§r§7Armor Toughness: §a+${stats.toughness}`);
    }

    const { total: damageReduction, protectionBonus, breachReduction } = getDamageReduction(stats.armor, stats.toughness, enchants, damage);

    let reductionText = `§r§7Damage Reduction: §a+${damageReduction.toFixed(1)}%`;
    if (protectionBonus > 0 || breachReduction > 0) {
      const bonusText = protectionBonus > 0 ? `+${protectionBonus.toFixed(1)}%` : "";
      const breachText = breachReduction > 0 ? `-${breachReduction.toFixed(1)}%` : "";
      const combinedText = [bonusText, breachText].filter((text) => text).join(", ");
      if (combinedText) {
        reductionText += ` §8(${combinedText})`;
      }
    }
    lore.push(reductionText);
  } else if (currentDurability !== null && maxDurability !== null) {
    lore.push(`§r§7Durability: ${currentDurability}/${maxDurability}`);
  } else {
    return null;
  }

  return lore.join("\n");
};

const updateInventoryLore = (container, playerTag, damage) => {
  for (let slot = 0; slot < container.size; slot++) {
    const item = container.getItem(slot);
    if (!item) continue;

    const enchantable = item.getComponent(ItemComponentTypes.Enchantable);
    const stats = armorData[item.typeId];
    const enchants = enchantable ? enchantable.getEnchantments() : [];

    const lore = buildLore(item, playerTag, stats, enchants, damage);
    if (lore) {
      item.setLore([lore]);
      container.setItem(slot, item);
    }
  }
};

const updateEquipmentLore = (equippable, playerTag, slots, damage) => {
  for (const slot of slots) {
    const eSlot = equippable.getEquipmentSlot(slot);
    if (!eSlot) continue;

    const item = eSlot.getItem();
    if (!item) continue;

    const enchantable = item.getComponent(ItemComponentTypes.Enchantable);
    const stats = armorData[item.typeId];
    const enchants = enchantable ? enchantable.getEnchantments() : [];

    const lore = buildLore(item, playerTag, stats, enchants, damage);
    if (!lore) continue;

    const currentLore = item.getLore() || [];
    const hasPlayerTag = currentLore.some((l) => l.includes("§8@"));
    if (hasPlayerTag && !currentLore.some((l) => l.includes(playerTag))) {
      continue;
    }

    const hasMatchingLore = currentLore.some((l) => l === lore);
    if (!hasMatchingLore) {
      item.setLore([lore]);
      eSlot.setItem(item);
    }
  }
};

export const dy = (player, damage = 10) => {
  const inventory = player.getComponent(EntityComponentTypes.Inventory);
  const container = inventory?.container;
  if (!container) return;

  const equippable = player.getComponent(EntityComponentTypes.Equippable);
  if (!equippable) return;

  const playerTag = `§8@${player.name}§r`;
  const slots = ["Head", "Chest", "Legs", "Feet", "Offhand"];

  updateInventoryLore(container, playerTag, damage);
  updateEquipmentLore(equippable, playerTag, slots, damage);
};
