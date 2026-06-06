import { EntityComponentTypes, EquipmentSlot, ItemComponentTypes } from '@minecraft/server';
import { armorData } from './help_armorData.js';
import { getDamageReduction } from './help_function.js';

const ARMOR_SLOTS = [EquipmentSlot.Head, EquipmentSlot.Chest, EquipmentSlot.Legs, EquipmentSlot.Feet, EquipmentSlot.Offhand];

const getEnchants = (item) => {
    const comp = item.getComponent(ItemComponentTypes.Enchantable);
    return comp ? comp.getEnchantments() : null;
};

const buildLore = (item, playerTag, stats, enchants, damage) => {
    const durComp = item.getComponent(ItemComponentTypes.Durability);
    const hasDur = !!durComp;
    const curDur = hasDur ? durComp.maxDurability - durComp.damage : 0;
    const maxDur = hasDur ? durComp.maxDurability : 0;

    let line = `§8[${playerTag}§8]\n`;

    if (stats) {
        line += `§r§7Armor: §a+${stats.armor}\n`;

        if (hasDur) line += `§r§7Armor Durability: ${curDur}/${maxDur}\n`;
        if (stats.toughness > 0) line += `§r§7Armor Toughness: §a+${stats.toughness}\n`;

        const { total, protectionBonus, breachReduction } = getDamageReduction(stats.armor, stats.toughness, enchants, damage);

        let reductionText = `§r§7Damage Reduction: §a+${total.toFixed(1)}%`;

        if (protectionBonus > 0 || breachReduction > 0) {
            let combo = '';

            if (protectionBonus > 0) combo += `+${protectionBonus.toFixed(1)}%`;
            if (breachReduction > 0) {
                if (combo) combo += ', ';
                combo += `-${breachReduction.toFixed(1)}%`;
            }

            if (combo) reductionText += ` §8(${combo})`;
        }

        line += reductionText;
    } else if (hasDur) {
        line += `§r§7Durability: ${curDur}/${maxDur}`;
    } else {
        return null;
    }
    return line;
};

const updateInventoryLore = (container, playerTag, damage) => {
    const size = container.size;

    for (let i = 0; i < size; i++) {
        const item = container.getItem(i);
        if (!item) continue;

        const enchants = getEnchants(item);
        const stats = armorData[item.typeId];

        const lore = buildLore(item, playerTag, stats, enchants, damage);
        if (!lore) continue;

        item.setLore([lore]);
        container.setItem(i, item);
    }
};

const updateEquipmentLore = (equippable, playerTag, damage) => {
    for (const slot of ARMOR_SLOTS) {
        const eSlot = equippable.getEquipmentSlot(slot);
        if (!eSlot) continue;

        const item = eSlot.getItem();
        if (!item) continue;

        const enchants = getEnchants(item);
        const stats = armorData[item.typeId];

        const lore = buildLore(item, playerTag, stats, enchants, damage);
        if (!lore) continue;

        const currentLore = item.getLore();
        if (currentLore && currentLore.length > 0) {
            let hasTag = false;
            let hasMatch = false;

            for (const line of currentLore) {
                if (line.includes('§8@')) hasTag = true;
                if (line === lore) hasMatch = true;
            }

            if (hasTag && !currentLore.some((l) => l.includes(playerTag))) continue;
            if (hasMatch) continue;
        }

        item.setLore([lore]);
        eSlot.setItem(item);
    }
};

export const dy = (player, damage = 10) => {
    if (!player?.isValid) return;

    const inventory = player.getComponent(EntityComponentTypes.Inventory);
    const container = inventory?.container;
    if (!container) return;

    const equippable = player.getComponent(EntityComponentTypes.Equippable);
    if (!equippable) return;

    const playerTag = `§8@${player.name}§r`;

    updateInventoryLore(container, playerTag, damage);
    updateEquipmentLore(equippable, playerTag, damage);
};
