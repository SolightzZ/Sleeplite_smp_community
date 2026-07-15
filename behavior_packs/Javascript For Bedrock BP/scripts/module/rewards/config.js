// =========================================================================
//  REWARDS MODULE — Centralized Configuration
//  All scattered constants consolidated here.
// =========================================================================

// ---- Namespace & Version ------------------------------------------------
export const MODULE_ID = 'rewards';
export const NAMESPACE = 'jrbp';
export const ADDON_VERSION = '1.0.0';

// ---- Dynamic Property Keys ----------------------------------------------
export const DP = Object.freeze({
   DAILY_REWARD: 'daily_reward_30day',
});

// ---- Tags ---------------------------------------------------------------
export const TAG = Object.freeze({
   VIP: 'vip',
   ADMIN: 'admin',
});

// ---- Scoreboard Objectives ----------------------------------------------
export const SCOREBOARD = Object.freeze({
});

// ---- Entity / Item IDs --------------------------------------------------
export const ID = Object.freeze({
   APPLE: 'minecraft:apple',
   BREAD: 'minecraft:bread',
   COAL: 'minecraft:coal',
   OAK_LOG: 'minecraft:oak_log',
   COOKED_BEEF: 'minecraft:cooked_beef',
   ENDER_PEARL: 'minecraft:ender_pearl',
   IRON_INGOT: 'minecraft:iron_ingot',
   SADDLE: 'minecraft:saddle',
   LAPIS_LAZULI: 'minecraft:lapis_lazuli',
   GOLDEN_CARROT: 'minecraft:golden_carrot',
   EXPERIENCE_BOTTLE: 'minecraft:experience_bottle',
   DRIED_KELP_BLOCK: 'minecraft:dried_kelp_block',
   GOLD_INGOT: 'minecraft:gold_ingot',
   TURTLE_SCUTE: 'minecraft:turtle_scute',
   REDSTONE: 'minecraft:redstone',
   BLUE_ICE: 'minecraft:blue_ice',
   BRICK_BLOCK: 'minecraft:brick_block',
   WIND_CHARGE: 'minecraft:wind_charge',
   DIAMOND: 'minecraft:diamond',
   SKULL: 'minecraft:skull',
   BOOK: 'minecraft:book',
   HONEY_BLOCK: 'minecraft:honey_block',
   SLIME: 'minecraft:slime',
   GOLDEN_APPLE: 'minecraft:golden_apple',
   TOTEM_OF_UNDYING: 'minecraft:totem_of_undying',
   ENCHANTED_GOLDEN_APPLE: 'minecraft:enchanted_golden_apple',
});

// ---- Block IDs ----------------------------------------------------------
export const BLOCK = Object.freeze({
});

// ---- Sound IDs ----------------------------------------------------------
export const SOUND = Object.freeze({
   OPEN: 'vault.open_shutter',
   BREAK: 'random.break',
   FIZZ: 'random.fizz',
   POP: 'random.pop2',
   LEVELUP: 'random.levelup',
   ERROR: 'block.false_permissions',
});

// ---- UI Icon Paths ------------------------------------------------------
export const UI_ICON = Object.freeze({
   CHECKMARK: 'textures/ui/worldsIcon.png',
   LOCKED: 'textures/ui/world_glyph_desaturated.png',
   CLAIMABLE: 'textures/ui/csbChevronArrowLarge.png',
});

// ---- UI Titles ----------------------------------------------------------
export const UI_TITLE = Object.freeze({
   MAIN: 'Daily Reward | ล็อกอินรายวัน',
   CONFIRM: 'Confirm',
});

// ---- UI Button Labels ---------------------------------------------------
export const UI_BUTTON = Object.freeze({
   CANCEL: 'Cancel',
   CLAIM: 'Claim',
});

// ---- Body Strings -------------------------------------------------------
export const FORM_BODY = Object.freeze({
   MAIN: (today, count) => `              Date: ${today}\n                Claimed: ${count} Days`,
   CONFIRM: (player, today, itemName, itemCount) =>
      [
         '§7==========================',
         ` §fPlayer: §e${player}`,
         ` §fDate: §e${today}`,
         '§7--------------------------',
         '',
         ' §fYou will receive:',
         ` §6➤ ${itemName} x${itemCount}`,
         '',
         '§7--------------------------',
         '§8(Click Claim to accept)',
      ].join('\n'),
});

// ---- Message Templates ---------------------------------------------------
export const MSG = Object.freeze({
   ALL_CLAIMED: '§a[/] คุณได้รับของรางวัลครบทุกวันแล้ว!',
   CLAIM_SUCCESS: (itemName) => `§a[/] §aรับของสำเร็จ! ได้รับ ${itemName}`,
   TITLE_SUCCESS: (itemName, count) => `§a${itemName} x${count}`,
   TITLE_WRONG_ORDER: '§cกรุณารับของตามลำดับ',
   TITLE_ALREADY_CLAIMED: '§cคุณรับของวันนี้ไปแล้ว',
   INVENTORY_FULL: '§c[x] §cช่องเก็บของเต็ม',
   TITLE_INVENTORY_FULL: '§cช่องเก็บของเต็ม',
   ADMIN_RESET: '§e[Admin] Data Reset!',
   NOT_PLAYER: '§cThis command can only be used by players!',
   STATUS_HEADER: '=== Player Status ===',
   STATUS_LINE: (name, count, last) => `§7${name}: Count=${count}, Last=${last || 'Never'}`,
   BUTTON_TODAY: 'Come back tomorrow',
   BUTTON_LOCKED: (day) => `§8Day ${day}: Locked`,
   BUTTON_READY: (day, itemName) => `Day ${day}: ${itemName} (Click!)`,
   BUTTON_PAST: (day, itemName) => `Day ${day}: ${itemName}`,
});

// ---- Footer --------------------------------------------------------------
export const FOOTER = '               @Sleeplite 2026';

// ---- Event Names ---------------------------------------------------------
export const EVENT = Object.freeze({
   ITEM_USE: 'rewards:itemUse',
   CHAT: 'rewards:chat',
});

// ---- Command Registration ------------------------------------------------
export const COMMAND = Object.freeze({
   NAME: 'addon:rw',
   DESCRIPTION: 'Rewards - รับรางวัลล็อกอิน',
   RESET: '!reset-login',
   CHECK: '!check-reward',
});

// ---- Permission Levels ---------------------------------------------------
export const PERMISSION = Object.freeze({
   ADMIN: TAG.ADMIN,
   VIP: TAG.VIP,
});

// ---- Multipliers ---------------------------------------------------------
export const MULTIPLIER = Object.freeze({
   VIP: 2,
});

// ---- Default Data Shape --------------------------------------------------
export const DEFAULT_DATA = Object.freeze({
   last: null,
   count: 0,
});

// ---- Total Days ----------------------------------------------------------
export const TOTAL_DAYS = 30;

// ---- Daily Reward Schedule -----------------------------------------------
export const REWARD_SCHEDULE = Object.freeze([
   // 1-7
   { day: 1, id: ID.APPLE, count: 8 },
   { day: 2, id: ID.BREAD, count: 12 },
   { day: 3, id: ID.COAL, count: 32 },
   { day: 4, id: ID.OAK_LOG, count: 16 },
   { day: 5, id: ID.COOKED_BEEF, count: 6 },
   { day: 6, id: ID.ENDER_PEARL, count: 8 },
   { day: 7, id: ID.IRON_INGOT, count: 64 },
   // 8-14
   { day: 8, id: ID.SADDLE, count: 1 },
   { day: 9, id: ID.LAPIS_LAZULI, count: 20 },
   { day: 10, id: ID.COOKED_BEEF, count: 16 },
   { day: 11, id: ID.GOLDEN_CARROT, count: 20 },
   { day: 12, id: ID.EXPERIENCE_BOTTLE, count: 32 },
   { day: 13, id: ID.DRIED_KELP_BLOCK, count: 10 },
   { day: 14, id: ID.GOLD_INGOT, count: 64 },
   // 15-21
   { day: 15, id: ID.TURTLE_SCUTE, count: 10 },
   { day: 16, id: ID.REDSTONE, count: 24 },
   { day: 17, id: ID.BLUE_ICE, count: 16 },
   { day: 18, id: ID.BRICK_BLOCK, count: 64 },
   { day: 19, id: ID.WIND_CHARGE, count: 8 },
   { day: 20, id: ID.GOLDEN_CARROT, count: 32 },
   { day: 21, id: ID.DIAMOND, count: 16 },
   // 22-28
   { day: 22, id: ID.SKULL, count: 3 },
   { day: 23, id: ID.BOOK, count: 32 },
   { day: 24, id: ID.HONEY_BLOCK, count: 16 },
   { day: 25, id: ID.SLIME, count: 32 },
   { day: 26, id: ID.WIND_CHARGE, count: 16 },
   { day: 27, id: ID.GOLDEN_APPLE, count: 64 },
   { day: 28, id: ID.TOTEM_OF_UNDYING, count: 5 },
   // 29-30
   { day: 29, id: ID.TOTEM_OF_UNDYING, count: 7 },
   { day: 30, id: ID.ENCHANTED_GOLDEN_APPLE, count: 7 },
]);
