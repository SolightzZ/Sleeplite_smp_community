import { ItemStack, ItemComponentTypes } from '@minecraft/server';
import { CATEGORY_KEYWORDS, MATERIAL_TIER, maxItemAmount } from '../config.js';
import { ItemCategories, RarityTiers } from '../data/rarity.js';
import { getItemDisplayName, getItemDurability } from './formatter.js';
import { cache } from '../../../shared/cache.js';

const getItemCategory = (item) => {
    if (!item?.typeId) return ItemCategories.misc;

    const id = item.typeId.toLowerCase();

    for (const [keyword, category] of CATEGORY_KEYWORDS) {
        if (new RegExp(`\\b${keyword}\\b`).test(id)) return category;
    }

    return ItemCategories.misc;
};

const getItemMaterialTier = (item) => {
    if (!item?.typeId) return 99;

    const id = item.typeId.toLowerCase();
    for (const [keyword, tier] of MATERIAL_TIER) {
        if (new RegExp(`\\b${keyword}\\b`).test(id)) return tier;
    }

    return 99;
};

const getItemRarity = (item) => {
    if (!item) return 999;

    const enchants = cache.getEnchantable(item);
    if (enchants?.getEnchantments?.()?.length > 0) return 4;

    return RarityTiers[item.typeId] ?? 5;
};

const getEnchantCount = (item) => {
    if (!item) return 0;

    return cache.getEnchantable(item)?.getEnchantments?.()?.length ?? 0;
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
        const hasDurA = !!cache.getComponent(a, ItemComponentTypes.Durability);
        const hasDurB = !!cache.getComponent(b, ItemComponentTypes.Durability);
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
    const safeAmount = amount < 1 ? 1 : amount > maxItemAmount ? maxItemAmount : amount;

    if (typeof ref.clone === 'function') {
        const c = ref.clone();
        c.amount = safeAmount;
        return c;
    }

    return cache.createItemStack(ref.typeId, safeAmount);
};
