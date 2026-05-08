import { Colors, SETTINGS } from "../config.js";
import { normalizeMode } from "../utils/mode.js";
import { compareItemsByMode } from "../utils/item.js";
import {
  isContainerSorted,
  sortAndMergeItems,
  writeContainerDiff,
} from "../utils/container.js";
import { formatBlockName } from "../utils/formatter.js";
import {
  applyChessPattern,
  applyLinePattern,
  applyColumnPattern,
} from "../patterns/index.js";

// ─── Helpers ───────────────────────────────────────────────────────────────

const readSlice = (container, start, length) => {
  const arr = new Array(length);
  for (let i = 0; i < length; i++) {
    arr[i] = container.getItem(start + i);
  }
  return arr;
};

const isAllEmpty = (arr) => {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i]) return false;
  }
  return true;
};

// ─── Public API ───────────────────────────────────────────────────────────

/**
 * Sort a player's main inventory (excludes hotbar).
 * Hotbar is left untouched.
 * @param {import("@minecraft/server").Player} player
 * @param {string} [mode="type"]
 * @returns {{ ok: boolean; msg: string }}
 */
export function sortPlayerInventory(player, mode) {
  if (!player?.isValid) {
    return { ok: false, msg: `${Colors.red}[x] Player is no longer valid` };
  }

  const inv = player.getComponent("minecraft:inventory")?.container;
  if (!inv) {
    return { ok: false, msg: `${Colors.red}[x] ไม่พบ Inventory ของผู้เล่น` };
  }

  const invSize   = inv.size;
  const hotbarEnd = SETTINGS.HOTBAR_SIZE;
  const mainLen   = invSize - hotbarEnd;
  const sortMode  = normalizeMode(mode);

  // Read main inventory (skip hotbar)
  const mainItems = readSlice(inv, hotbarEnd, mainLen);

  // Skip if already empty or sorted (check main inventory only, not hotbar)
  if (isAllEmpty(mainItems)) {
    return { ok: true, msg: `${Colors.green}[/] เรียงเรียบร้อยแล้ว` };
  }

  if (isContainerSorted(inv, sortMode, hotbarEnd)) {
    return { ok: true, msg: `${Colors.green}[/] เรียงเรียบร้อยแล้ว` };
  }

  // Merge + sort
  const merged = sortAndMergeItems(mainItems, mainLen);
  merged.sort((a, b) => compareItemsByMode(a, b, sortMode));

  // Write only changed slots — skip hotbar via startSlot offset
  writeContainerDiff(inv, merged, hotbarEnd);

  return {
    ok: true,
    msg: `${Colors.yellow}[Inventory] ${Colors.white}เรียงสำเร็จ ${Colors.gray}(${sortMode})`,
  };
}

/**
 * Sort the container of the block the player is looking at.
 * Pattern modes (chess/line/column) arrange items visually instead of sorting by value.
 * @param {import("@minecraft/server").Player} player
 * @param {string} [mode="type"]
 * @returns {{ ok: boolean; msg: string }}
 */
export function sortBlockContainer(player, mode) {
  if (!player?.isValid) {
    return { ok: false, msg: `${Colors.red}[x] Player is no longer valid` };
  }

  const bv = player.getBlockFromViewDirection?.();
  if (!bv?.block) {
    return { ok: false, msg: `${Colors.red}[!] ไม่พบบล็อกที่เล็งอยู่` };
  }

  const block     = bv.block;
  const container = block.getComponent("minecraft:inventory")?.container;
  if (!container) {
    return { ok: false, msg: `${Colors.red}[!] บล็อกนี้ไม่มีช่องเก็บของ` };
  }

  const sortMode = normalizeMode(mode);
  const size     = container.size;

  // Collect non-empty items from container
  const rawItems = [];
  for (let i = 0; i < size; i++) {
    const it = container.getItem(i);
    if (it) rawItems.push(it);
  }

  const itemCount  = rawItems.length;
  const emptySlots = size - itemCount;

  if (itemCount === 0) {
    return { ok: true, msg: `${Colors.green}[/] ตู้ว่างเปล่า` };
  }

  let merged;

  if (sortMode === "chess" || sortMode === "line" || sortMode === "column") {
    // Pattern modes: sort by amount ascending (น้อย→มาก), then typeId as tiebreaker
    const sorted = sortAndMergeItems(rawItems, size);
    sorted.sort((a, b) => {
      if (!a && !b) return 0;
      if (!a) return 1;
      if (!b) return -1;
      if (a.amount !== b.amount) return a.amount - b.amount;
      return a.typeId < b.typeId ? -1 : a.typeId > b.typeId ? 1 : 0;
    });

    if (sortMode === "chess")  merged = applyChessPattern(sorted, size);
    else if (sortMode === "line")   merged = applyLinePattern(sorted, size);
    else                            merged = applyColumnPattern(sorted, size);
  } else {
    if (isContainerSorted(container, sortMode)) {
      return { ok: true, msg: `${Colors.green}[/] เรียงเรียบร้อยแล้ว` };
    }
    merged = sortAndMergeItems(rawItems, size);
    merged.sort((a, b) => compareItemsByMode(a, b, sortMode));
  }

  writeContainerDiff(container, merged);

  const blockName = formatBlockName(block.typeId);
  return {
    ok: true,
    msg: `${Colors.yellow}[${blockName}] ${Colors.white}เรียงสำเร็จ ${Colors.gray}${itemCount} ไอเทม / ${emptySlots} ช่องว่าง (${sortMode})`,
  };
}
