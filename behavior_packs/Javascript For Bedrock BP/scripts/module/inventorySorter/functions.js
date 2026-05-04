import { ItemStack } from "@minecraft/server";
import { ITEM_CATEGORIES, RARITY_ORDER, SORTING_MODES } from "./constants.js";

function countTotalItems(items) {
  if (!items) return 0;
  return items.reduce((total, item) => {
    return total + (item ? item.amount : 0);
  }, 0);
}

function normalizeMode(mode) {
  const m = (mode ?? "type").toLowerCase();
  return SORTING_MODES[m] ?? "type";
}

function getItemRarity(item) {
  if (!item) return 999;

  const enchants = item.getComponent("minecraft:enchantable");
  if (enchants?.getEnchantments?.()?.length > 0) return 4;

  return RARITY_ORDER[item.typeId] ?? 5;
}

function getItemCategory(item) {
  if (!item?.typeId) return ITEM_CATEGORIES.misc;

  const id = item.typeId.toLowerCase();

  if (
    id.includes("sword") ||
    id.includes("bow") ||
    id.includes("crossbow") ||
    id.includes("trident") ||
    id.includes("axe")
  ) {
    return ITEM_CATEGORIES.weapon;
  }

  if (
    id.includes("pickaxe") ||
    id.includes("shovel") ||
    id.includes("hoe") ||
    id.includes("shears") ||
    id.includes("flint_and_steel")
  ) {
    return ITEM_CATEGORIES.tool;
  }

  if (
    id.includes("helmet") ||
    id.includes("chestplate") ||
    id.includes("leggings") ||
    id.includes("boots") ||
    id.includes("elytra")
  ) {
    return ITEM_CATEGORIES.armor;
  }

  if (
    id.includes("apple") ||
    id.includes("bread") ||
    id.includes("meat") ||
    id.includes("cooked") ||
    id.includes("golden_carrot") ||
    id.includes("stew")
  ) {
    return ITEM_CATEGORIES.food;
  }

  if (
    id.includes("_block") ||
    id.includes("stone") ||
    id.includes("wood") ||
    id.includes("plank") ||
    id.includes("brick") ||
    id.includes("concrete")
  ) {
    return ITEM_CATEGORIES.block;
  }

  if (
    id.includes("ingot") ||
    id.includes("gem") ||
    id.includes("dust") ||
    id.includes("nugget") ||
    id.includes("shard")
  ) {
    return ITEM_CATEGORIES.material;
  }

  return ITEM_CATEGORIES.misc;
}

function getItemDurability(item) {
  if (!item) return 0;

  const durability = item.getComponent("minecraft:durability");
  if (!durability) return 100;

  const current = durability.damage || 0;
  const max = durability.maxDurability || 1;

  return ((max - current) / max) * 100;
}

function getItemDisplayName(item) {
  if (!item?.typeId) return "zzz";

  if (item.nameTag) return item.nameTag.toLowerCase();

  return item.typeId
    .replace("minecraft:", "")
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
    .toLowerCase();
}

function compareItemsByMode(a, b, mode) {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;

  if (mode === "asc" || mode === "desc") {
    if (a.amount === b.amount) {
      return a.typeId < b.typeId ? -1 : 1;
    }
    return mode === "desc"
      ? a.amount < b.amount
        ? 1
        : -1
      : a.amount > b.amount
        ? 1
        : -1;
  }

  if (mode === "rarity") {
    const rarityA = getItemRarity(a);
    const rarityB = getItemRarity(b);

    if (rarityA !== rarityB) {
      return rarityA - rarityB;
    }

    if (a.typeId === b.typeId) {
      return b.amount - a.amount;
    }
    return a.typeId < b.typeId ? -1 : 1;
  }

  if (mode === "stack") {
    const maxA = a.maxAmount ?? 64;
    const maxB = b.maxAmount ?? 64;

    if (maxA !== maxB) {
      return maxB - maxA;
    }

    if (a.typeId === b.typeId) {
      return b.amount - a.amount;
    }
    return a.typeId < b.typeId ? -1 : 1;
  }

  if (mode === "tool") {
    const catA = getItemCategory(a);
    const catB = getItemCategory(b);

    if (catA !== catB) {
      return catA - catB;
    }

    if (a.typeId === b.typeId) {
      return b.amount - a.amount;
    }
    return a.typeId < b.typeId ? -1 : 1;
  }

  if (mode === "name") {
    const nameA = getItemDisplayName(a);
    const nameB = getItemDisplayName(b);

    if (nameA !== nameB) {
      return nameA < nameB ? -1 : 1;
    }

    return b.amount - a.amount;
  }

  if (mode === "durability") {
    const durA = getItemDurability(a);
    const durB = getItemDurability(b);

    if (Math.abs(durA - durB) > 0.1) {
      return durB - durA;
    }

    if (a.typeId === b.typeId) {
      return b.amount - a.amount;
    }
    return a.typeId < b.typeId ? -1 : 1;
  }

  if (a.typeId === b.typeId) {
    if (a.amount === b.amount) return 0;
    return a.amount < b.amount ? 1 : -1;
  }

  return a.typeId < b.typeId ? -1 : 1;
}

function cloneWithAmountLike(ref, amount) {
  const hasCustomData = ref.nameTag || ref.getLore?.()?.length > 0;
  const safeAmount = Math.max(1, Math.min(255, amount || 1));

  if (hasCustomData && typeof ref.clone === "function") {
    const c = ref.clone();
    c.amount = safeAmount;
    return c;
  }

  return new ItemStack(ref.typeId, safeAmount);
}

function getStackKey(item) {
  if (!item?.typeId) return null;

  const lore = item.getLore?.() || [];
  if (!item.nameTag && lore.length === 0) {
    return item.typeId;
  }

  return `${item.typeId}_${item.nameTag || ""}_${JSON.stringify(lore)}`;
}

function sortAndMergeItems(items, maxSize) {
  try {
    const buckets = new Map();

    for (const it of items) {
      if (!it?.typeId) continue;

      const stackKey = getStackKey(it);
      if (!stackKey) continue;

      if (!buckets.has(stackKey)) {
        buckets.set(stackKey, { ref: it, total: it.amount });
      } else {
        const g = buckets.get(stackKey);
        g.total += it.amount;
      }
    }

    const out = [];
    const maxAmountCache = new Map();

    for (const group of buckets.values()) {
      const typeId = group.ref.typeId;

      if (!maxAmountCache.has(typeId)) {
        maxAmountCache.set(typeId, group.ref.maxAmount ?? 64);
      }
      const maxAmt = maxAmountCache.get(typeId);

      let remain = group.total;

      while (remain > 0 && out.length < maxSize) {
        const take = Math.min(remain, maxAmt);
        out.push(cloneWithAmountLike(group.ref, take));
        remain -= take;
      }
    }

    while (out.length < maxSize) {
      out.push(undefined);
    }

    return out;
  } catch (e) {
    console.warn("[sortAndMergeItems] error:", e);
    return items;
  }
}

function applyChessPattern(items, containerSize) {
  const result = new Array(containerSize).fill(undefined);
  let itemIndex = 0;

  for (let i = 0; i < containerSize; i += 2) {
    if (itemIndex < items.length) {
      result[i] = items[itemIndex++];
    }
  }

  for (let i = 1; i < containerSize; i += 2) {
    if (itemIndex < items.length) {
      result[i] = items[itemIndex++];
    }
  }

  return result;
}

function applyLinePattern(items, containerSize) {
  const result = new Array(containerSize).fill(undefined);
  const rowSize = 9;
  let itemIndex = 0;

  const primarySlots = [];
  const secondarySlots = [];

  for (let i = 0; i < containerSize; i++) {
    const rowNumber = Math.floor(i / rowSize);
    if (rowNumber % 2 === 0) {
      primarySlots.push(i);
    } else {
      secondarySlots.push(i);
    }
  }

  for (const slot of primarySlots) {
    if (itemIndex < items.length) {
      result[slot] = items[itemIndex++];
    }
  }

  for (const slot of secondarySlots) {
    if (itemIndex < items.length) {
      result[slot] = items[itemIndex++];
    }
  }

  return result;
}

function applyColumnPattern(items, containerSize) {
  const result = new Array(containerSize).fill(undefined);
  const rowSize = 9;
  let itemIndex = 0;

  const primarySlots = [];
  const secondarySlots = [];

  for (let i = 0; i < containerSize; i++) {
    const col = i % rowSize;
    if (col % 2 === 0) {
      primarySlots.push(i);
    } else {
      secondarySlots.push(i);
    }
  }

  for (const slot of primarySlots) {
    if (itemIndex < items.length) {
      result[slot] = items[itemIndex++];
    }
  }

  for (const slot of secondarySlots) {
    if (itemIndex < items.length) {
      result[slot] = items[itemIndex++];
    }
  }

  return result;
}

function isInventorySortedAndMerged(items, maxSize, mode = "type") {
  try {
    let prev = null;
    let foundEmpty = false;

    for (const cur of items) {
      if (foundEmpty && cur) return false;

      if (!cur) {
        foundEmpty = true;
        continue;
      }

      if (prev && compareItemsByMode(prev, cur, mode) > 0) {
        return false;
      }

      if (
        prev &&
        prev.typeId === cur.typeId &&
        prev.amount < (prev.maxAmount ?? 64) &&
        cur.isStackableWith?.(prev)
      ) {
        return false;
      }

      prev = cur;
    }

    return true;
  } catch {
    return false;
  }
}

function isContainerSorted(container, mode = "type") {
  try {
    let prev = null;
    let foundEmpty = false;

    for (let i = 0; i < container.size; i++) {
      const cur = container.getItem(i);

      if (foundEmpty && cur) return false;

      if (!cur) {
        foundEmpty = true;
        continue;
      }

      if (prev && compareItemsByMode(prev, cur, mode) > 0) {
        return false;
      }

      if (
        prev &&
        prev.typeId === cur.typeId &&
        prev.amount < (prev.maxAmount ?? 64) &&
        cur.isStackableWith?.(prev)
      ) {
        return false;
      }

      prev = cur;
    }

    return true;
  } catch {
    return false;
  }
}

function writeContainerDiff(container, newItems) {
  const size = Math.min(container.size, newItems.length);

  for (let i = 0; i < size; i++) {
    const cur = container.getItem(i);
    const nxt = newItems[i];

    const same =
      (!cur && !nxt) ||
      (cur && nxt && cur.typeId === nxt.typeId && cur.amount === nxt.amount);

    if (!same) {
      container.setItem(i, nxt);
    }
  }
}

function formatBlockName(typeId) {
  return (typeId ?? "minecraft:unknown")
    .replace("minecraft:", "")
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export {
  sortAndMergeItems,
  applyChessPattern,
  applyLinePattern,
  applyColumnPattern,
  isInventorySortedAndMerged,
  isContainerSorted,
  writeContainerDiff,
  formatBlockName,
  countTotalItems,
  normalizeMode,
  compareItemsByMode,
  cloneWithAmountLike,
};
