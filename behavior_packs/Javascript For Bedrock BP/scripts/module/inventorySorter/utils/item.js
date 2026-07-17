import { ItemComponentTypes } from '@minecraft/server';
import { cache } from '../../../shared/cache.js';
import { VanillaItems } from '../../../shared/vanillaItems.js';
import { CATEGORY_KEYWORDS, maxItemAmount } from '../config.js';
import { ItemCategories, RarityTiers } from '../data/rarity.js';
import { VanillaItemData } from '../data/vanillaItems.js';
import { getItemDisplayName, getItemDurability } from './formatter.js';

/**
 * @param {import('@minecraft/server').ItemStack | { typeId?: string } | null | undefined} item
 * @returns {boolean}
 */
export const isVanillaItem = (item) => !!item?.typeId && VanillaItems.isValidItem(item.typeId);

/**
 * @param {import('@minecraft/server').ItemStack | { typeId?: string } | null | undefined} item
 * @returns {boolean}
 */
export const isVanillaBlock = (item) => !!item?.typeId && VanillaItems.isValidBlock(item.typeId);

const getItemData = (item) => {
   if (!item?.typeId) return null;
   return VanillaItemData[item.typeId] ?? null;
};

const _WOOD_SET = new Set(['oak', 'spruce', 'birch', 'jungle', 'acacia', 'dark_oak', 'mangrove', 'cherry', 'bamboo', 'crimson', 'warped', 'wood']);
const _STONE_SET = new Set([
   'stone',
   'cobblestone',
   'andesite',
   'diorite',
   'granite',
   'deepslate',
   'blackstone',
   'basalt',
   'sandstone',
   'prismarine',
   'netherrack',
   'end_stone',
   'quartz',
   'tuff',
   'calcite',
   'dirt',
   'grass',
   'gravel',
   'sand',
   'clay',
   'obsidian',
   'bedrock',
   'ice',
   'snow',
   'terracotta',
   'concrete',
]);
const _METAL_TIER = { netherite: 2, diamond: 3, iron: 4, gold: 5, copper: 6, leather: 9 };
const _WOOD_SHAPE = /(chest|barrel|boat|bowl|sign|ladder|painting|item_frame|crafting_table|bookshelf|jukebox|note_block|frame)$/;
const _segments = (id) => id.split(/[^a-z0-9]+/);

const getItemCategory = (item) => {
   const d = getItemData(item);
   if (d) return d.cat;

   if (!item?.typeId) return ItemCategories.misc;

   const id = item.typeId.toLowerCase();

   for (const [keyword, category] of CATEGORY_KEYWORDS) {
      if (new RegExp(`\\b${keyword}\\b`).test(id)) return category;
   }

   if (/(sword|bow|crossbow|trident|mace)$/.test(id)) return ItemCategories.weapon;
   if (/(axe|pickaxe|shovel|hoe|shears|fishing_rod|brush|flint_and_steel|shield)$/.test(id)) return ItemCategories.tool;
   if (/(helmet|chestplate|leggings|boots|elytra)$/.test(id)) return ItemCategories.armor;
   if (/(ingot|nugget|gem|dust|shard|scrap|crystal|raw_|coal|redstone|lapis|emerald|diamond|iron_|gold_|copper_|netherite_|quartz|amethyst|glowstone)$/.test(id)) return ItemCategories.material;
   if (
      /(block|planks|log|stairs|slab|fence|wall|door|trapdoor|button|_plate|glass|sand|stone|cobble|brick|concrete|wool|carpet|leaves|grass|dirt|ore|obsidian|ice|snow|clay|terracotta|prismarine|end_stone|netherrack|basalt|blackstone|deepslate|andesite|diorite|granite)$/.test(
         id,
      )
   )
      return ItemCategories.block;
   if (/(stew|soup|potato|carrot|cookie|cake|melon|beetroot|fish|salmon|chorus_fruit|berry|apple|meat|bread|golden|potion|honey)$/.test(id)) return ItemCategories.food;
   if (isVanillaBlock(item)) return ItemCategories.block;

   return ItemCategories.misc;
};

export const getItemMaterialGroup = (item) => {
   const d = getItemData(item);
   if (d) return d.grp;

   if (!item?.typeId) return 99;

   const segs = _segments(item.typeId.toLowerCase());
   for (const s of segs) {
      if (_WOOD_SET.has(s)) return 0;
      if (_STONE_SET.has(s)) return 1;
      if (Object.prototype.hasOwnProperty.call(_METAL_TIER, s)) return 2;
   }
   if (_WOOD_SHAPE.test(item.typeId.toLowerCase())) return 0;

   return 99;
};

const getItemMaterialTier = (item) => {
   const d = getItemData(item);
   if (d) return d.tier;

   if (!item?.typeId) return 99;

   const segs = _segments(item.typeId.toLowerCase());
   for (const s of segs) {
      if (Object.prototype.hasOwnProperty.call(_METAL_TIER, s)) return _METAL_TIER[s];
      if (_WOOD_SET.has(s)) return 8;
      if (_STONE_SET.has(s)) return 7;
   }

   return 99;
};

const getItemRarity = (item) => {
   if (!item) return 999;

   const enchants = cache.getEnchantable(item);
   if (enchants?.getEnchantments?.()?.length > 0) return 4;

   const d = getItemData(item);
   if (d) return d.r;

   const curated = RarityTiers[item.typeId];
   if (curated !== undefined) return curated;

   const tier = getItemMaterialTier(item);
   if (tier <= 3) return 2;
   if (tier <= 6) return 1;
   if (tier <= 9) return 0;

   return 5;
};

const getEnchantCount = (item) => {
   if (!item) return 0;

   return cache.getEnchantable(item)?.getEnchantments?.()?.length ?? 0;
};

export const compareItemsByMode = (a, b, mode) => {
   if (!a && !b) return 0;
   if (!a) return 1;
   if (!b) return -1;

   const groupDiff = getItemMaterialGroup(a) - getItemMaterialGroup(b);
   if (groupDiff !== 0) return groupDiff;

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

   if (mode === 'group') {
      const ga = getItemMaterialGroup(a);
      const gb = getItemMaterialGroup(b);
      if (ga !== gb) return ga - gb;
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
