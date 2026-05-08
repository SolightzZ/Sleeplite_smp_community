import { ItemStack } from "@minecraft/server";
import { ITEM_CATEGORIES, RARITY_ORDER } from "../data/rarity.js";
import { getItemDurability, getItemDisplayName } from "./formatter.js";

// ─── Category keyword lookup table ─────────────────────────────────────────
// Grouped by category priority. Each entry: [keyword, categoryValue].
// Checked in order — first match wins.
const CATEGORY_KEYWORDS = /** @type {[string, number][]} */ ([
  // weapon
  ["sword",           ITEM_CATEGORIES.weapon],
  ["bow",             ITEM_CATEGORIES.weapon],
  ["crossbow",        ITEM_CATEGORIES.weapon],
  ["trident",         ITEM_CATEGORIES.weapon],
  // tool (axe must come after weapon check — axes can be weapons but classified tool here)
  ["axe",             ITEM_CATEGORIES.tool],
  ["pickaxe",         ITEM_CATEGORIES.tool],
  ["shovel",          ITEM_CATEGORIES.tool],
  ["hoe",             ITEM_CATEGORIES.tool],
  ["shears",          ITEM_CATEGORIES.tool],
  ["flint_and_steel", ITEM_CATEGORIES.tool],
  ["fishing_rod",     ITEM_CATEGORIES.tool],
  ["compass",         ITEM_CATEGORIES.tool],
  ["clock",           ITEM_CATEGORIES.tool],
  // armor
  ["helmet",          ITEM_CATEGORIES.armor],
  ["chestplate",      ITEM_CATEGORIES.armor],
  ["leggings",        ITEM_CATEGORIES.armor],
  ["boots",           ITEM_CATEGORIES.armor],
  ["elytra",          ITEM_CATEGORIES.armor],
  // food
  ["apple",           ITEM_CATEGORIES.food],
  ["bread",           ITEM_CATEGORIES.food],
  ["meat",            ITEM_CATEGORIES.food],
  ["cooked",          ITEM_CATEGORIES.food],
  ["golden_carrot",   ITEM_CATEGORIES.food],
  ["stew",            ITEM_CATEGORIES.food],
  ["soup",            ITEM_CATEGORIES.food],
  ["cake",            ITEM_CATEGORIES.food],
  ["cookie",          ITEM_CATEGORIES.food],
  ["beetroot",        ITEM_CATEGORIES.food],
  ["melon",           ITEM_CATEGORIES.food],
  ["carrot",          ITEM_CATEGORIES.food],
  ["potato",          ITEM_CATEGORIES.food],
  ["fish",            ITEM_CATEGORIES.food],
  ["salmon",          ITEM_CATEGORIES.food],
  // block
  ["_block",          ITEM_CATEGORIES.block],
  ["stone",           ITEM_CATEGORIES.block],
  ["wood",            ITEM_CATEGORIES.block],
  ["plank",           ITEM_CATEGORIES.block],
  ["brick",           ITEM_CATEGORIES.block],
  ["concrete",        ITEM_CATEGORIES.block],
  ["sand",            ITEM_CATEGORIES.block],
  ["gravel",          ITEM_CATEGORIES.block],
  ["dirt",            ITEM_CATEGORIES.block],
  ["grass",           ITEM_CATEGORIES.block],
  ["log",             ITEM_CATEGORIES.block],
  ["leaves",          ITEM_CATEGORIES.block],
  ["glass",           ITEM_CATEGORIES.block],
  ["wool",            ITEM_CATEGORIES.block],
  // material
  ["ingot",           ITEM_CATEGORIES.material],
  ["gem",             ITEM_CATEGORIES.material],
  ["dust",            ITEM_CATEGORIES.material],
  ["nugget",          ITEM_CATEGORIES.material],
  ["shard",           ITEM_CATEGORIES.material],
  ["crystal",         ITEM_CATEGORIES.material],
  ["scrap",           ITEM_CATEGORIES.material],
]);

const CATEGORY_KEYWORDS_LEN = CATEGORY_KEYWORDS.length;

/**
 * @param {import("@minecraft/server").ItemStack|null|undefined} item
 * @returns {number} ITEM_CATEGORIES value
 */
export const getItemCategory = (item) => {
  if (!item?.typeId) return ITEM_CATEGORIES.misc;
  const id = item.typeId.toLowerCase();
  for (let i = 0; i < CATEGORY_KEYWORDS_LEN; i++) {
    if (id.includes(CATEGORY_KEYWORDS[i][0])) return CATEGORY_KEYWORDS[i][1];
  }
  return ITEM_CATEGORIES.misc;
};

/**
 * @param {import("@minecraft/server").ItemStack|null|undefined} item
 * @returns {number} rarity tier (0–4, lower = more common)
 */
export const getItemRarity = (item) => {
  if (!item) return 999;
  const enchants = item.getComponent("minecraft:enchantable");
  if (enchants?.getEnchantments?.()?.length > 0) return 4;
  return RARITY_ORDER[item.typeId] ?? 5;
};

/**
 * Sort comparator — returns negative/0/positive for stable sort.
 * null/undefined items are pushed to the end.
 * @param {import("@minecraft/server").ItemStack|null|undefined} a
 * @param {import("@minecraft/server").ItemStack|null|undefined} b
 * @param {string} mode
 * @returns {number}
 */
export const compareItemsByMode = (a, b, mode) => {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;

  if (mode === "asc" || mode === "desc") {
    if (a.amount !== b.amount) {
      return mode === "desc" ? b.amount - a.amount : a.amount - b.amount;
    }
    return a.typeId < b.typeId ? -1 : a.typeId > b.typeId ? 1 : 0;
  }

  if (mode === "rarity") {
    const ra = getItemRarity(a);
    const rb = getItemRarity(b);
    if (ra !== rb) return ra - rb;
    if (a.typeId === b.typeId) return b.amount - a.amount;
    return a.typeId < b.typeId ? -1 : 1;
  }

  if (mode === "stack") {
    const ma = a.maxAmount ?? 64;
    const mb = b.maxAmount ?? 64;
    if (ma !== mb) return mb - ma;
    if (a.typeId === b.typeId) return b.amount - a.amount;
    return a.typeId < b.typeId ? -1 : 1;
  }

  if (mode === "tool") {
    const ca = getItemCategory(a);
    const cb = getItemCategory(b);
    if (ca !== cb) return ca - cb;
    if (a.typeId === b.typeId) return b.amount - a.amount;
    return a.typeId < b.typeId ? -1 : 1;
  }

  if (mode === "name") {
    const na = getItemDisplayName(a);
    const nb = getItemDisplayName(b);
    if (na !== nb) return na < nb ? -1 : 1;
    return b.amount - a.amount;
  }

  if (mode === "durability") {
    const da = getItemDurability(a);
    const db = getItemDurability(b);
    if (Math.abs(da - db) > 0.1) return db - da;
    if (a.typeId === b.typeId) return b.amount - a.amount;
    return a.typeId < b.typeId ? -1 : 1;
  }

  // default: "type" — sort by typeId then descending amount
  if (a.typeId !== b.typeId) return a.typeId < b.typeId ? -1 : 1;
  return b.amount - a.amount;
};

/**
 * Clone an ItemStack, preserving nameTag/lore if present.
 * @param {import("@minecraft/server").ItemStack} ref
 * @param {number} amount
 * @returns {import("@minecraft/server").ItemStack}
 */
export const cloneWithAmountLike = (ref, amount) => {
  const safeAmount = amount < 1 ? 1 : amount > 255 ? 255 : amount;
  const hasCustomData = ref.nameTag || (ref.getLore?.()?.length > 0);
  if (hasCustomData && typeof ref.clone === "function") {
    const c = ref.clone();
    c.amount = safeAmount;
    return c;
  }
  return new ItemStack(ref.typeId, safeAmount);
};
