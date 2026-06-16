import { ItemStack, ItemComponentTypes } from '@minecraft/server';
import { ItemCategories, RarityTiers } from '../data/rarity.js';
import { getItemDisplayName, getItemDurability } from './formatter.js';

const CATEGORY_KEYWORDS = [
    ['sword', ItemCategories.weapon],
    ['bow', ItemCategories.weapon],
    ['crossbow', ItemCategories.weapon],
    ['trident', ItemCategories.weapon],
    ['axe', ItemCategories.tool],
    ['pickaxe', ItemCategories.tool],
    ['shovel', ItemCategories.tool],
    ['hoe', ItemCategories.tool],
    ['shears', ItemCategories.tool],
    ['flint_and_steel', ItemCategories.tool],
    ['fishing_rod', ItemCategories.tool],
    ['compass', ItemCategories.tool],
    ['clock', ItemCategories.tool],
    ['helmet', ItemCategories.armor],
    ['chestplate', ItemCategories.armor],
    ['leggings', ItemCategories.armor],
    ['boots', ItemCategories.armor],
    ['elytra', ItemCategories.armor],
    ['apple', ItemCategories.food],
    ['bread', ItemCategories.food],
    ['meat', ItemCategories.food],
    ['cooked', ItemCategories.food],
    ['golden_carrot', ItemCategories.food],
    ['stew', ItemCategories.food],
    ['soup', ItemCategories.food],
    ['cake', ItemCategories.food],
    ['cookie', ItemCategories.food],
    ['beetroot', ItemCategories.food],
    ['melon', ItemCategories.food],
    ['carrot', ItemCategories.food],
    ['potato', ItemCategories.food],
    ['fish', ItemCategories.food],
    ['salmon', ItemCategories.food],
    ['_block', ItemCategories.block],
    ['stone', ItemCategories.block],
    ['wood', ItemCategories.block],
    ['plank', ItemCategories.block],
    ['brick', ItemCategories.block],
    ['concrete', ItemCategories.block],
    ['sand', ItemCategories.block],
    ['gravel', ItemCategories.block],
    ['dirt', ItemCategories.block],
    ['grass', ItemCategories.block],
    ['log', ItemCategories.block],
    ['leaves', ItemCategories.block],
    ['glass', ItemCategories.block],
    ['wool', ItemCategories.block],
    ['ingot', ItemCategories.material],
    ['gem', ItemCategories.material],
    ['dust', ItemCategories.material],
    ['nugget', ItemCategories.material],
    ['shard', ItemCategories.material],
    ['crystal', ItemCategories.material],
    ['scrap', ItemCategories.material],
];

const MATERIAL_TIER = [
    ['demon', 0],
    ['wolf', 1],
    ['netherite', 2],
    ['diamond', 3],
    ['iron', 4],
    ['gold', 5],
    ['copper', 6],
    ['stone', 7],
    ['wood', 8],
    ['leather', 9],
];

export const getItemCategory = (item) => {
    if (!item?.typeId) return ItemCategories.misc;

    const id = item.typeId.toLowerCase();

    for (const [keyword, category] of CATEGORY_KEYWORDS) {
        if (new RegExp(`\\b${keyword}\\b`).test(id)) return category;
    }

    return ItemCategories.misc;
};

export const getItemMaterialTier = (item) => {
    if (!item?.typeId) return 99;

    const id = item.typeId.toLowerCase();
    for (const [keyword, tier] of MATERIAL_TIER) {
        if (new RegExp(`\\b${keyword}\\b`).test(id)) return tier;
    }

    return 99;
};

export const getItemRarity = (item) => {
    if (!item) return 999;

    const enchants = item.getComponent(ItemComponentTypes.Enchantable);
    if (enchants?.getEnchantments?.()?.length > 0) return 4;

    return RarityTiers[item.typeId] ?? 5;
};

const getEnchantCount = (item) => {
    if (!item) return 0;

    return item.getComponent(ItemComponentTypes.Enchantable)?.getEnchantments?.()?.length ?? 0;
};

export const compareItemsByMode = (a, b, mode) => {
    if (!a && !b) return 0;
    if (!a) return 1;
    if (!b) return -1;

    if (mode === 'asc' || mode === 'desc') {
        if (a.amount !== b.amount) {
            return mode === 'desc' ? b.amount - a.amount : a.amount - b.amount;
        }
        return a.typeId < b.typeId ? -1 : a.typeId > b.typeId ? 1 : 0;
    }

    if (mode === 'rarity') {
        const ra = getItemRarity(a);
        const rb = getItemRarity(b);
        if (ra !== rb) return rb - ra;
        if (a.typeId === b.typeId) return b.amount - a.amount;
        return a.typeId < b.typeId ? -1 : 1;
    }

    if (mode === 'stack') {
        const ma = a.maxAmount ?? 64;
        const mb = b.maxAmount ?? 64;
        if (ma !== mb) return mb - ma;
        if (a.typeId === b.typeId) return b.amount - a.amount;
        return a.typeId < b.typeId ? -1 : 1;
    }

    if (mode === 'tool') {
        const ca = getItemCategory(a);
        const cb = getItemCategory(b);
        if (ca !== cb) return ca - cb;
        if (a.typeId === b.typeId) return b.amount - a.amount;
        return a.typeId < b.typeId ? -1 : 1;
    }

    if (mode === 'name') {
        const na = getItemDisplayName(a);
        const nb = getItemDisplayName(b);
        if (na !== nb) return na < nb ? -1 : 1;
        return b.amount - a.amount;
    }

    if (mode === 'enchant') {
        const ea = getEnchantCount(a);
        const eb = getEnchantCount(b);
        if (ea !== eb) return eb - ea;
        if (a.typeId === b.typeId) return b.amount - a.amount;
        return a.typeId < b.typeId ? -1 : 1;
    }

    if (mode === 'material') {
        const ma = getItemMaterialTier(a);
        const mb = getItemMaterialTier(b);
        if (ma !== mb) return ma - mb;
        const ca = getItemCategory(a);
        const cb = getItemCategory(b);
        if (ca !== cb) return ca - cb;
        if (a.typeId === b.typeId) return b.amount - a.amount;
        return a.typeId < b.typeId ? -1 : 1;
    }

    if (mode === 'durability') {
        const hasDurA = !!a.getComponent(ItemComponentTypes.Durability);
        const hasDurB = !!b.getComponent(ItemComponentTypes.Durability);
        if (hasDurA !== hasDurB) return hasDurA ? -1 : 1;
        if (hasDurA && hasDurB) {
            const da = getItemDurability(a);
            const db = getItemDurability(b);
            if (Math.abs(da - db) > 0.1) return db - da;
        }

        if (a.typeId === b.typeId) return b.amount - a.amount;
        return a.typeId < b.typeId ? -1 : 1;
    }

    if (a.typeId !== b.typeId) return a.typeId < b.typeId ? -1 : 1;
    return b.amount - a.amount;
};

export const cloneWithAmountLike = (ref, amount) => {
    const safeAmount = amount < 1 ? 1 : amount > 255 ? 255 : amount;

    if (typeof ref.clone === 'function') {
        const c = ref.clone();
        c.amount = safeAmount;
        return c;
    }

    return new ItemStack(ref.typeId, safeAmount);
};
