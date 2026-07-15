import { cache } from '../../shared/cache.js';
import { world } from '@minecraft/server';

// =========================================================================
//  NAMETAG MODULE — Centralized Configuration
//  All scattered constants consolidated here.
// =========================================================================

// ---- Namespace & Version ------------------------------------------------
export const MODULE_ID = 'nametag';
export const NAMESPACE = 'jrbp';
export const ADDON_VERSION = '1.0.0';

// ---- Dynamic Property Keys ----------------------------------------------
export const DP = Object.freeze({
});

// ---- Scoreboard Objectives ----------------------------------------------
export const SCOREBOARD = Object.freeze({
});

// ---- Entity Tags --------------------------------------------------------
export const TAG = Object.freeze({
   ADMIN: 'admin',
   PREFIX_RANK: 'rank:',
   PREFIX_ACTIVE: 'active:',
});
export const RANK_PREFIX_LENGTH = TAG.PREFIX_RANK.length;
export const ACTIVE_PREFIX_LENGTH = TAG.PREFIX_ACTIVE.length;

// ---- Entity / Item / Block IDs ------------------------------------------
export const ID = Object.freeze({
});

// ---- UI Titles ----------------------------------------------------------
export const UI_TITLE = Object.freeze({
   MANAGER: 'Manager Ranks  |ระบบจัดการยศ',
   ADD: 'เพิ่ม / เปลี่ยนยศ',
   EDIT: 'แก้ไขชื่อยศ',
   REMOVE: 'ลบยศ',
   RENAME: 'เปลี่ยนชื่อยศ',
   CONFIRM_DELETE: 'ยืนยันลบยศ',
});

// ---- UI Button Labels ---------------------------------------------------
export const UI_BUTTON = Object.freeze({
   ADD: 'เพิ่ม / เปลี่ยนยศ',
   EDIT: 'แก้ไขชื่อยศ',
   REMOVE: 'ลบยศ',
   CONFIRM: 'Confirm (ลบ)',
   CANCEL: 'Cancel (ยกเลิก)',
});

// ---- UI Icon Paths ------------------------------------------------------
export const UI_ICON = Object.freeze({
   CATEGORIES: 'textures/ui/sidebar_icons/categories',
   CLASSIC_SKINS: 'textures/ui/sidebar_icons/classic_skins',
   TRENDING: 'textures/ui/icons/icon_trending',
});

// ---- ActionForm / ModalForm Strings -------------------------------------
export const FORM_LABEL = Object.freeze({
   BODY_MANAGER: '§7เลือกผู้เล่นที่ต้องการจัดการ:',
   DROPDOWN_PREDEFINED: 'เลือกยศสำเร็จรูป:',
   DROPDOWN_EXISTING: 'หรือเลือกจากที่มีอยู่:',
   TEXTFIELD_NEW: 'หรือตั้งชื่อยศใหม่:',
   DROPDOWN_SELECT: 'เลือกยศ:',
   TEXTFIELD_RENAME: 'ชื่อใหม่',
   PLACEHOLDER_RANK: 'เช่น [Admin]',
   NONE: '(ไม่มี)',
   SELECT_PROMPT: '-- เลือก --',
});

// ---- UI Body / Message Templates ----------------------------------------
export const MSG = Object.freeze({
   RANK_SET: (rank) => `§a[RANK] ตั้งยศ '${rank}' เรียบร้อย`,
   RANK_NONE: '§c[RANK] ไม่มียศ',
   BODY_ACTIONS: (current, count) =>
      `ยศที่ใช้อยู่: ${current}\nจำนวนยศที่มี: ${count}`,
   BODY_CONFIRM_DELETE: (ranks) => `ยศที่จะลบ:\n${ranks.join('\n')}`,
});

// ---- Sound IDs ----------------------------------------------------------
export const SOUND = Object.freeze({
   OPEN: 'block.loom.use',
   ADD: 'block.smithing_table.use',
   LEVELUP: 'random.levelup',
   ERROR: 'block.false_permissions',
   EDIT: 'block.grindstone.use',
   RENAME: 'random.orb',
   DELETE: 'random.anvil_break',
   ACTIONS: 'block.cartography_table.use',
});

// ---- Particle IDs -------------------------------------------------------
export const PARTICLE = Object.freeze({
});

// ---- Block IDs ----------------------------------------------------------
export const BLOCK = Object.freeze({
});

// ---- Item IDs -----------------------------------------------------------
export const ITEM = Object.freeze({
});

// ---- Structure IDs ------------------------------------------------------
export const STRUCTURE = Object.freeze({
});

// ---- Dimension IDs ------------------------------------------------------
export const DIMENSION = Object.freeze({
});

// ---- Event Names --------------------------------------------------------
export const EVENT = Object.freeze({
   PLAYER_JOIN: 'nametag:playerJoin',
   ITEM_USE: 'nametag:itemUse',
});

// ---- Permission Levels --------------------------------------------------
export const PERMISSION = Object.freeze({
   ADMIN: TAG.ADMIN,
});

// ---- Cooldown Values (ticks) --------------------------------------------
export const COOLDOWN = Object.freeze({
});

// ---- System Tick Constants ----------------------------------------------
export const TICK = Object.freeze({
});

// ---- Radius / Distance --------------------------------------------------
export const RADIUS = Object.freeze({
});

export const DISTANCE = Object.freeze({
});

// ---- Timeouts (ticks) ---------------------------------------------------
export const TIMEOUT = Object.freeze({
});

// ---- Spawn / Protection Limits ------------------------------------------
export const LIMIT = Object.freeze({
   SPAWN: {},
   PROTECTION: {},
});

// ---- Default Settings ---------------------------------------------------
export const DEFAULT = Object.freeze({
   RANK: '\uE00B',
});

// ---- World Property Names -----------------------------------------------
export const WORLD_PROPERTY = Object.freeze({
});

// ---- Predefined Ranks (icon map) ----------------------------------------
export const PREDEFINED_RANKS = Object.freeze({
   JUNIOR: '\uE009',
   ADMIN: '\uE00A',
   SMP: '\uE00B',
   YOUTUBE: '\uE00C',
   VIP: '\uE00D',
   STAFF: '\uE00E',
   SERVER: '\uE00F',
   WARNING: '\uE019',
   EVENT: '\uE01A',
   HECK: '\uE01B',
   NPC: '\uE01C',
   QUEST: '\uE01D',
   PUBLISH: '\uE01E',
   LEVEL: '\uE01F',
   BRONZE: '\uE029',
   SILVER: '\uE02A',
   GOLD: '\uE02B',
   IRON: '\uE02C',
   DIAMOND: '\uE02D',
   EMERALD: '\uE02E',
   MASTER: '\uE02F',
   DOCTOR: '\uE039',
   POLICE: '\uE03A',
   MINER: '\uE03B',
   FARMER: '\uE03C',
   ANGLER: '\uE03D',
   BANDIT: '\uE03E',
   LOGGER: '\uE03F',
});

// =========================================================================
//  Helper: validate config on import (optional runtime check)
// =========================================================================
export const validateConfig = () => {
   const errors = [];
   if (!MODULE_ID) errors.push('MODULE_ID is empty');
   if (errors.length) {
      const msg = `[${MODULE_ID}] Config validation failed:\n${errors.join('\n')}`;
      cache?.sendMessage?.(msg);
      return false;
   }
   return true;
};
