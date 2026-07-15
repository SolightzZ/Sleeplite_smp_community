import { ItemComponentTypes } from '@minecraft/server';
import { cloneWithAmountLike, compareItemsByMode } from './item.js';
import { cache } from '../../../shared/cache.js';

const _getEnchantString = (item) => {
    const enchants = cache.getEnchantable(item)?.getEnchantments?.();
    if (!enchants || enchants.length === 0) return '';

    const parts = new Array(enchants.length);
    for (let i = 0; i < enchants.length; i++) {
        parts[i] = `${enchants[i].type.id}:${enchants[i].level}`;
    }

    parts.sort();
    return parts.join(',');
};

const buildStackKey = (item) => {
    if (!item?.typeId) return null;

    const enchStr = _getEnchantString(item);
    const lore = item.getLore?.();
    const loreStr = lore && lore.length > 0 ? JSON.stringify(lore) : '';

    if (!item.nameTag && !loreStr && !enchStr) return item.typeId;

    return `${item.typeId}\x00${item.nameTag || ''}\x00${loreStr}\x00${enchStr}`;
};

export const sortAndMergeItems = (items, maxSize) => {
    const buckets = new Map();

    for (const it of items) {
        if (!it?.typeId) continue;

        const key = buildStackKey(it);
        if (!key) continue;

        const entry = buckets.get(key);

        if (entry) {
            entry.total += it.amount;
        } else {
            buckets.set(key, { ref: it, total: it.amount });
        }
    }

    const out = [];
    const maxAmountCache = new Map();
    const bucketValues = Array.from(buckets.values());

    for (const group of bucketValues) {
        const typeId = group.ref.typeId;
        let maxAmt = maxAmountCache.get(typeId);

        if (maxAmt === undefined) {
            maxAmt = group.ref.maxAmount ?? 64;
            maxAmountCache.set(typeId, maxAmt);
        }

        let remain = group.total;
        while (remain > 0 && out.length < maxSize) {
            const take = remain > maxAmt ? maxAmt : remain;
            out.push(cloneWithAmountLike(group.ref, take));
            remain -= take;
        }

        if (out.length >= maxSize) break;
    }

    const outLen = out.length;
    for (let i = outLen; i < maxSize; i++) {
        out.push(undefined);
    }
    return out;
};

export const isContainerSorted = (container, mode = 'type', startSlot = 0) => {
    let prev = null;
    let foundEmpty = false;
    const items = cache.getContainerItems(container);

    for (let i = startSlot; i < items.length; i++) {
        const cur = items[i];
        if (!cur) {
            foundEmpty = true;
            continue;
        }

        if (foundEmpty) return false;
        if (prev) {
            if (compareItemsByMode(prev, cur, mode) > 0) return false;
            if (prev.typeId === cur.typeId && prev.amount < (prev.maxAmount ?? 64) && cur.isStackableWith?.(prev)) return false;
        }
        prev = cur;
    }
    return true;
};

const buildEnchantFingerprint = (item) => _getEnchantString(item);

export const writeContainerDiff = (container, newItems, startSlot = 0) => {
    const items = cache.getContainerItems(container);
    const maxWrite = items.length - startSlot;
    const len = newItems.length < maxWrite ? newItems.length : maxWrite;

    for (let i = 0; i < len; i++) {
        const cur = items[startSlot + i];
        const nxt = newItems[i];

        if (!cur && !nxt) continue;
        if (cur && nxt && cur.typeId === nxt.typeId && cur.amount === nxt.amount && cur.nameTag === nxt.nameTag) {
            const curLore = cur.getLore?.();
            const nxtLore = nxt.getLore?.();
            const loreMatch = curLore && nxtLore ? JSON.stringify(curLore) === JSON.stringify(nxtLore) : !curLore?.length && !nxtLore?.length;
            if (loreMatch && buildEnchantFingerprint(cur) === buildEnchantFingerprint(nxt)) continue;
        }
        container.setItem(startSlot + i, nxt);
    }
};
