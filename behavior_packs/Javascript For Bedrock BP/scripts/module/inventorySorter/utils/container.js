import { cloneWithAmountLike, compareItemsByMode } from "./item.js";

/**
 * Build a stable stack key for grouping identical items.
 * Items that share typeId, nameTag, lore, and enchantments are treated as the same stack.
 * @param {import("@minecraft/server").ItemStack|null|undefined} item
 * @returns {string|null}
 */
const getStackKey = (item) => {
  if (!item?.typeId) return null;

  // Build enchantment fingerprint — items with different enchants must NOT merge
  const enchComp = item.getComponent("minecraft:enchantable");
  const enchants = enchComp?.getEnchantments?.();
  let enchStr = "";
  if (enchants && enchants.length > 0) {
    // Sort by type so order doesn't matter
    const parts = new Array(enchants.length);
    for (let i = 0; i < enchants.length; i++) {
      parts[i] = `${enchants[i].type.id}:${enchants[i].level}`;
    }
    parts.sort();
    enchStr = parts.join(",");
  }

  const lore = item.getLore?.();
  const loreStr = lore && lore.length > 0 ? JSON.stringify(lore) : "";

  if (!item.nameTag && !loreStr && !enchStr) return item.typeId;
  return `${item.typeId}\x00${item.nameTag || ""}\x00${loreStr}\x00${enchStr}`;
};

/**
 * Count total items across a slot array.
 * @param {(import("@minecraft/server").ItemStack|null|undefined)[]|null|undefined} items
 * @returns {number}
 */
export const countTotalItems = (items) => {
  if (!items) return 0;
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    if (items[i]) total += items[i].amount;
  }
  return total;
};

/**
 * Merge duplicate stacks then split into max-stack chunks.
 * Returns an array padded to maxSize with undefined.
 * Does NOT sort — caller is responsible for sorting afterward.
 * @param {(import("@minecraft/server").ItemStack|null|undefined)[]} items
 * @param {number} maxSize
 * @returns {(import("@minecraft/server").ItemStack|undefined)[]}
 */
export const sortAndMergeItems = (items, maxSize) => {
  const buckets = new Map();

  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    if (!it?.typeId) continue;
    const key = getStackKey(it);
    if (!key) continue;
    const entry = buckets.get(key);
    if (entry) {
      entry.total += it.amount;
    } else {
      buckets.set(key, { ref: it, total: it.amount });
    }
  }

  const out = /** @type {(import("@minecraft/server").ItemStack|undefined)[]} */ ([]);
  const maxAmountCache = new Map();

  const bucketValues = Array.from(buckets.values());
  for (let g = 0; g < bucketValues.length; g++) {
    const group = bucketValues[g];
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

  // Pad to maxSize
  const outLen = out.length;
  for (let i = outLen; i < maxSize; i++) {
    out.push(undefined);
  }
  return out;
};

/**
 * Check if a slot array is already sorted, merged, and has no holes before items.
 * @param {(import("@minecraft/server").ItemStack|null|undefined)[]} items
 * @param {number} _maxSize - unused but kept for API symmetry
 * @param {string} [mode="type"]
 * @returns {boolean}
 */
export const isInventorySortedAndMerged = (items, _maxSize, mode = "type") => {
  let prev = null;
  let foundEmpty = false;
  for (let i = 0; i < items.length; i++) {
    const cur = items[i];
    if (!cur) {
      foundEmpty = true;
      continue;
    }
    if (foundEmpty) return false;
    if (prev) {
      if (compareItemsByMode(prev, cur, mode) > 0) return false;
      if (prev.typeId === cur.typeId &&
          prev.amount < (prev.maxAmount ?? 64) &&
          cur.isStackableWith?.(prev)) return false;
    }
    prev = cur;
  }
  return true;
};

/**
 * Check if a Container is already sorted — reads directly from the container
 * to avoid allocating a temp array.
 * @param {import("@minecraft/server").Container} container
 * @param {string} [mode="type"]
 * @param {number} [startSlot=0] - first slot to check (use HOTBAR_SIZE to skip hotbar)
 * @returns {boolean}
 */
export const isContainerSorted = (container, mode = "type", startSlot = 0) => {
  let prev = null;
  let foundEmpty = false;
  const size = container.size;
  for (let i = startSlot; i < size; i++) {
    const cur = container.getItem(i);
    if (!cur) {
      foundEmpty = true;
      continue;
    }
    if (foundEmpty) return false;
    if (prev) {
      if (compareItemsByMode(prev, cur, mode) > 0) return false;
      if (prev.typeId === cur.typeId &&
          prev.amount < (prev.maxAmount ?? 64) &&
          cur.isStackableWith?.(prev)) return false;
    }
    prev = cur;
  }
  return true;
};

/**
 * Build an enchantment fingerprint string for equality checks.
 * @param {import("@minecraft/server").ItemStack} item
 * @returns {string}
 */
const getEnchantFingerprint = (item) => {
  const enchants = item.getComponent("minecraft:enchantable")?.getEnchantments?.();
  if (!enchants || enchants.length === 0) return "";
  const parts = new Array(enchants.length);
  for (let i = 0; i < enchants.length; i++) {
    parts[i] = `${enchants[i].type.id}:${enchants[i].level}`;
  }
  parts.sort();
  return parts.join(",");
};

/**
 * Write only changed slots to minimize API calls — critical for multiplayer performance.
 * Two items are considered equal if they share typeId, amount, nameTag, lore, and enchantments.
 * @param {import("@minecraft/server").Container} container
 * @param {(import("@minecraft/server").ItemStack|null|undefined)[]} newItems
 * @param {number} [startSlot=0] - write offset into the container (e.g. HOTBAR_SIZE to skip hotbar)
 */
export const writeContainerDiff = (container, newItems, startSlot = 0) => {
  const maxWrite = container.size - startSlot;
  const len = newItems.length < maxWrite ? newItems.length : maxWrite;
  for (let i = 0; i < len; i++) {
    const cur = container.getItem(startSlot + i);
    const nxt = newItems[i];

    if (!cur && !nxt) continue;

    if (cur && nxt &&
        cur.typeId === nxt.typeId &&
        cur.amount === nxt.amount &&
        cur.nameTag === nxt.nameTag) {
      const curLore = cur.getLore?.();
      const nxtLore = nxt.getLore?.();
      const loreMatch = curLore && nxtLore
        ? JSON.stringify(curLore) === JSON.stringify(nxtLore)
        : !curLore?.length && !nxtLore?.length;
      if (loreMatch && getEnchantFingerprint(cur) === getEnchantFingerprint(nxt)) continue;
    }

    container.setItem(startSlot + i, nxt);
  }
};
