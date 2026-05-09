import { ColorCodes, INVENTORY_SLOTS } from "../config.js";
import {
  applyChessPattern,
  applyColumnPattern,
  applyLinePattern,
} from "../patterns/index.js";
import {
  isContainerSorted,
  sortAndMergeItems,
  writeContainerDiff,
} from "../utils/container.js";
import { formatBlockName } from "../utils/formatter.js";
import { compareItemsByMode } from "../utils/item.js";
import { normalizeMode } from "../utils/mode.js";

const readContainerSlice = (container, start, length) => {
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

export function sortPlayerInventory(player, mode) {
  if (!player?.isValid) {
    return { ok: false, msg: `${ColorCodes.red}[x] Player is no longer valid` };
  }

  const inv = player.getComponent("minecraft:inventory")?.container;
  if (!inv) {
    return { ok: false, msg: `${ColorCodes.red}[x] Inventory not found` };
  }

  const invSize = inv.size;
  const hotbarEnd = INVENTORY_SLOTS.HOTBAR;
  const mainLen = invSize - hotbarEnd;
  const sortMode = normalizeMode(mode);
  const mainItems = readContainerSlice(inv, hotbarEnd, mainLen);

  if (isAllEmpty(mainItems)) {
    return { ok: true, msg: `${ColorCodes.green}[/] Already sorted` };
  }

  if (isContainerSorted(inv, sortMode, hotbarEnd)) {
    return { ok: true, msg: `${ColorCodes.green}[/] Already sorted` };
  }

  const merged = sortAndMergeItems(mainItems, mainLen);
  merged.sort((a, b) => compareItemsByMode(a, b, sortMode));
  writeContainerDiff(inv, merged, hotbarEnd);

  return {
    ok: true,
    msg: `${ColorCodes.yellow}[Inventory] ${ColorCodes.white}Sorted ${ColorCodes.gray}(${sortMode})`,
  };
}

export function sortBlockContainer(player, mode) {
  if (!player?.isValid) {
    return { ok: false, msg: `${ColorCodes.red}[x] Player is no longer valid` };
  }

  const bv = player.getBlockFromViewDirection?.();
  if (!bv?.block) {
    return { ok: false, msg: `${ColorCodes.red}[!] No block in view` };
  }

  const block = bv.block;
  const container = block.getComponent("minecraft:inventory")?.container;
  if (!container) {
    return { ok: false, msg: `${ColorCodes.red}[!] Block has no inventory` };
  }

  const sortMode = normalizeMode(mode);
  const size = container.size;
  const rawItems = [];

  for (let i = 0; i < size; i++) {
    const it = container.getItem(i);
    if (it) rawItems.push(it);
  }

  const itemCount = rawItems.length;
  const emptySlots = size - itemCount;

  if (itemCount === 0) {
    return { ok: true, msg: `${ColorCodes.green}[/] Container is empty` };
  }

  let merged;
  if (sortMode === "chess" || sortMode === "line" || sortMode === "column") {
    const sorted = sortAndMergeItems(rawItems, size);
    sorted.sort((a, b) => {
      if (!a && !b) return 0;
      if (!a) return 1;
      if (!b) return -1;
      if (a.amount !== b.amount) return a.amount - b.amount;
      return a.typeId < b.typeId ? -1 : a.typeId > b.typeId ? 1 : 0;
    });
    if (sortMode === "chess") merged = applyChessPattern(sorted, size);
    else if (sortMode === "line") merged = applyLinePattern(sorted, size);
    else merged = applyColumnPattern(sorted, size);
  } else {
    if (isContainerSorted(container, sortMode)) {
      return { ok: true, msg: `${ColorCodes.green}[/] Already sorted` };
    }
    merged = sortAndMergeItems(rawItems, size);
    merged.sort((a, b) => compareItemsByMode(a, b, sortMode));
  }

  writeContainerDiff(container, merged);
  const blockName = formatBlockName(block.typeId);
  return {
    ok: true,
    msg: `${ColorCodes.yellow}[${blockName}] ${ColorCodes.white}Sorted ${ColorCodes.gray}${itemCount} items / ${emptySlots} empty (${sortMode})`,
  };
}
