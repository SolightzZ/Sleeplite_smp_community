import { BlockComponentTypes, EntityComponentTypes } from '@minecraft/server';
import { ColorCodes, INVENTORY_SLOTS, msgContainerEmpty, msgLookAtChest, msgNoInventory, msgNotContainer, msgPlayerInvalid, msgSortResult, msgSorted } from '../config.js';
import { applyChessPattern, applyColumnPattern, applyLinePattern } from '../patterns/patterns.js';
import { isContainerSorted, sortAndMergeItems, writeContainerDiff } from '../utils/container.js';
import { formatBlockName } from '../utils/formatter.js';
import { compareItemsByMode } from '../utils/item.js';
import { normalizeMode } from '../utils/mode.js';
import { cache } from '../../../shared/cache.js';
import { pcheck } from './../../../shared/player.js';

const readContainerSlice = (container, start, length) => {
    const items = cache.getContainerItems(container);
    const arr = new Array(length);
    for (let i = 0; i < length; i++) {
        arr[i] = items[start + i];
    }
    return arr;
};

const _patternComparator = (a, b) => {
    if (!a && !b) return 0;
    if (!a) return 1;
    if (!b) return -1;
    if (a.amount !== b.amount) return a.amount - b.amount;
    return a.typeId < b.typeId ? -1 : a.typeId > b.typeId ? 1 : 0;
};

const _sortByMode = (rawItems, sortMode, size, container, startSlot = 0) => {
    if (sortMode === 'chess' || sortMode === 'line' || sortMode === 'column') {
        const sorted = sortAndMergeItems(rawItems, size);
        sorted.sort(_patternComparator);
        if (sortMode === 'chess') return applyChessPattern(sorted, size);
        if (sortMode === 'line') return applyLinePattern(sorted, size);
        return applyColumnPattern(sorted, size);
    }
    if (isContainerSorted(container, sortMode, startSlot)) return null;
    const merged = sortAndMergeItems(rawItems, size);
    merged.sort((a, b) => compareItemsByMode(a, b, sortMode));
    return merged;
};

export function sortPlayerInventory(player, mode) {
    if (!pcheck(player)) {
        return { ok: false, msg: msgPlayerInvalid };
    }

    const inv = cache.getInventory(player);
    if (!inv) {
        return { ok: false, msg: msgNoInventory };
    }

    const invSize = inv.size;
    const hotbarEnd = INVENTORY_SLOTS.HOTBAR;
    const mainLen = invSize - hotbarEnd;
    const sortMode = normalizeMode(mode);
    const mainItems = readContainerSlice(inv, hotbarEnd, mainLen);

    const rawItems = [];
    for (const item of mainItems) {
        if (item) rawItems.push(item);
    }

    if (rawItems.length === 0) {
        return { ok: true, msg: msgSorted };
    }

    const merged = _sortByMode(rawItems, sortMode, mainLen, inv, hotbarEnd);
    if (merged === null) {
        return { ok: true, msg: msgSorted };
    }

    writeContainerDiff(inv, merged, hotbarEnd);

    return {
        ok: true,
        msg: msgSortResult,
    };
}

export function sortBlockContainer(player, mode) {
    if (!pcheck(player)) {
        return { ok: false, msg: msgPlayerInvalid };
    }

    const bv = player.getBlockFromViewDirection?.();
    if (!bv?.block) {
        return {
            ok: false,
                msg: msgLookAtChest,
        };
    }

    const block = bv.block;
    const container = cache.getBlockInventory(block);
    if (!container) {
        return { ok: false, msg: msgNotContainer };
    }

    const sortMode = normalizeMode(mode);
    const items = cache.getContainerItems(container);
    const rawItems = [];

    for (let i = 0; i < items.length; i++) {
        const it = items[i];
        if (it) rawItems.push(it);
    }

    const itemCount = rawItems.length;
    const emptySlots = size - itemCount;

    if (itemCount === 0) {
        return { ok: true, msg: msgContainerEmpty };
    }

    const merged = _sortByMode(rawItems, sortMode, size, container, 0);
    if (merged === null) {
        return { ok: true, msg: msgSorted };
    }

    writeContainerDiff(container, merged);
    const blockName = formatBlockName(block.typeId);
    return {
        ok: true,
        msg: `${ColorCodes.yellow}[${blockName}] ${ColorCodes.white}จัดเรียงเรียบร้อยแล้ว ${ColorCodes.gray}${itemCount} ไอเทม / ${emptySlots} ช่องว่าง`,
    };
}
