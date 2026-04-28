import {
  compareItemsByMode,
  sortAndMergeItems,
  isContainerSorted,
  writeContainerDiff,
  normalizeMode,
  formatBlockName,
  applyChessPattern,
  applyLinePattern,
  applyColumnPattern,
} from "./functions.js";
import { SETTINGS, Colors } from "./constants.js";

export function sortPlayerInventory(player, mode) {
  const inv = player.getComponent("minecraft:inventory")?.container;
  if (!inv) return { ok: false, msg: `${Colors.red}[x] ไม่พบ Inventory ของผู้เล่น` };

  const invSize = inv.size;
  const hotbarSize = SETTINGS.HOTBAR_SIZE;
  const sortMode = normalizeMode(mode);

  const hotbarItems = Array.from({ length: hotbarSize }, (_, i) => inv.getItem(i));
  const mainItems = Array.from({ length: invSize - hotbarSize }, (_, i) => inv.getItem(i + hotbarSize));

  const hotbarDone = isContainerSorted(inv, sortMode) || hotbarItems.every((item) => !item);
  const mainDone = mainItems.every((item) => !item);

  if (hotbarDone && mainDone) {
    return { ok: true, msg: `${Colors.green}[/] เรียงเรียบร้อยแล้ว` };
  }

  const newHotbar = hotbarDone ? hotbarItems : sortAndMergeItems(hotbarItems, hotbarSize).sort((a, b) => compareItemsByMode(a, b, sortMode));
  const newMain = mainDone ? mainItems : sortAndMergeItems(mainItems, invSize - hotbarSize).sort((a, b) => compareItemsByMode(a, b, sortMode));

  writeContainerDiff(inv, [...newHotbar, ...newMain]);

  return {
    ok: true,
    msg: `${Colors.yellow}[Inventory] ${Colors.white}เรียงสำเร็จ ${Colors.gray}(${sortMode})`,
  };
}

export function sortBlockContainer(player, mode) {
  const bv = player.getBlockFromViewDirection?.();
  const block = bv?.block;
  if (!block) return { ok: false, msg: `${Colors.red}[!] ไม่พบบล็อกที่เล็งอยู่` };

  const container = block.getComponent("minecraft:inventory")?.container;
  if (!container) return { ok: false, msg: `${Colors.red}[!] บล็อกนี้ไม่มีช่องเก็บของ` };

  const sortMode = normalizeMode(mode);
  const size = container.size;

  const items = Array.from({ length: size }, (_, i) => container.getItem(i)).filter(Boolean);

  let merged;

  if (sortMode === "chess") {
    const sorted = sortAndMergeItems(items, items.length).sort((a, b) => compareItemsByMode(a, b, "type"));

    merged = applyChessPattern(sorted, size);
  } else if (sortMode === "line") {
    const sorted = sortAndMergeItems(items, items.length).sort((a, b) => compareItemsByMode(a, b, "type"));

    merged = applyLinePattern(sorted, size);
  } else if (sortMode === "column") {
    const sorted = sortAndMergeItems(items, items.length).sort((a, b) => compareItemsByMode(a, b, "type"));

    merged = applyColumnPattern(sorted, size);
  } else {
    if (isContainerSorted(container, sortMode)) {
      return { ok: true, msg: `${Colors.green}[/] เรียงเรียบร้อยแล้ว` };
    }
    merged = sortAndMergeItems(items, size).sort((a, b) => compareItemsByMode(a, b, sortMode));
  }

  writeContainerDiff(container, merged);

  const blockName = formatBlockName(block.typeId);
  const itemCount = items.length;
  const emptySlots = size - itemCount;

  return {
    ok: true,
    msg: `${Colors.yellow}[${blockName}] ${Colors.white}เรียงสำเร็จ ${Colors.gray}${itemCount} ไอเทม / ${emptySlots} ช่องว่าง §7(${sortMode})`,
  };
}
