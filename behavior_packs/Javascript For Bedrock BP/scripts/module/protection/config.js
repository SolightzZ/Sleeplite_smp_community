import { cache } from '../../shared/cache.js';



// Namespace & Version
export const MODULE_ID = 'protection';
export const NAMESPACE = 'jrbp';
export const ADDON_VERSION = '1.0.0';

// Dynamic Property Keys
export const DP = Object.freeze({
   ZONE_DATA: 'ZONE_DATA',
});
export const MAX_STORAGE_SIZE = 32768;

// Scoreboard Objectives
export const SCOREBOARD = Object.freeze({
});

// Tags
export const TAG = Object.freeze({
   ADMIN: 'admin',
});

// Entity / Item / Block IDs
export const ID = Object.freeze({
   PLAYER: 'minecraft:player',
   DIAMOND_BLOCK: 'minecraft:diamond_block',
   PARTICLE_BORDER: 'minecraft:endrod',
});

// Container Block IDs
export const CONTAINER_BLOCKS = Object.freeze([
   'minecraft:chest',
   'minecraft:trapped_chest',
   'minecraft:barrel',
   'minecraft:furnace',
   'minecraft:blast_furnace',
   'minecraft:smoker',
   'minecraft:hopper',
   'minecraft:dropper',
   'minecraft:dispenser',
   'minecraft:brewing_stand',
   'minecraft:shulker_box',
   'minecraft:undyed_shulker_box',
]);

// Dimension IDs
export const DIMENSION = Object.freeze({
   OVERWORLD: 'minecraft:overworld',
   NETHER: 'minecraft:nether',
   END: 'minecraft:the_end',
});

// Dimension Labels (UI)
export const DIMENSION_LABEL = Object.freeze({
   [DIMENSION.OVERWORLD]: 'Overworld',
   [DIMENSION.NETHER]: 'Nether',
   [DIMENSION.END]: 'End',
});

// Sound IDs
export const SOUND = Object.freeze({
   OPEN: 'trial_spawner.charge_activate',
   CREATE: 'trial_spawner.charge_activate',
   ERROR: 'block.false_permissions',
   SUCCESS: 'random.levelup',
   DELETE: 'mob.pause_growth',
   ADMIN_DELETE: 'item.spear.use',
   ADMIN_TP: 'random.anvil_land',
   FLAGS: 'block.loom.use',
   MEMBERS: 'block.cartography_table.use',
   BORDER: 'conduit.activate',
});

// Particle IDs
export const PARTICLE = Object.freeze({
   BORDER: ID.PARTICLE_BORDER,
});

// UI Titles
export const UI_TITLE = Object.freeze({
   MAIN: 'Protect | โพรเทค',
   DELETE: 'ลบโพรเทค',
   DELETE_CONFIRM: 'ยืนยันอีกครั้ง',
   CREATE: 'สร้างโพรเทค',
   MEMBERS: 'จัดการสมาชิก',
   FLAGS: 'ตั้งค่าสิทธิ์',
   ADMIN_DELETE: 'ลบโพรเทค (แอดมิน)',
   ADMIN_TP: 'เทเลพอร์ต (แอดมิน)',
});

// UI Button Labels
export const UI_BUTTON = Object.freeze({
   CREATE: 'สร้างโพรเทค',
   DELETE: 'ลบโพรเทค',
   FLAGS: 'ตั้งค่าสิทธิ์',
   MEMBERS: 'จัดการสมาชิก',
   BORDER: 'แสดงขอบเขต',
   ADMIN_DELETE: 'ลบโพรเทค (แอดมิน)',
   ADMIN_TP: 'เทเลพอร์ต (แอดมิน)',
   OK: 'ตกลง',
   CANCEL: 'ยกเลิก',
   ADD_MEMBER: 'เพิ่มสมาชิก',
   REMOVE_MEMBER: 'ลบสมาชิก',
});

// UI Icon Paths
export const UI_ICON = Object.freeze({
   CREATE: 'textures/ui/sidebar_icons/addon',
   FLAGS: 'textures/ui/profile_glyph_combined',
   MEMBERS: 'textures/ui/sidebar_icons/wish_list',
   BORDER: 'textures/ui/sidebar_icons/classic_skins',
   DELETE: 'textures/ui/sidebar_icons/squaredonut',
   ADMIN_DELETE: 'textures/ui/sidebar_icons/promotag',
   ADMIN_TP: 'textures/ui/sidebar_icons/my_characters',
   CHECK: 'textures/ui/check',
   CANCEL: 'textures/ui/cancel',
});

// Form Label / Body / Message Strings
export const FORM_LABEL = Object.freeze({
   DROPDOWN_ACTION: 'การดำเนินการ',
   DROPDOWN_PLAYER: 'ผู้เล่น',
   DROPDOWN_SELECT: 'เลือกโพรเทค',
});

export const FORM_BODY = Object.freeze({
   DELETE: 'คุณแน่ใจหรือไม่ว่าต้องการลบโพรเทคนี้',
   DELETE_CONFIRM: 'กรุณายืนยันอีกครั้งเพื่อลบโพรเทค',
   CREATE: (size) => `คุณต้องการสร้างโพรเทคขนาด ${size}x${size} ที่นี่หรือไม่?\nต้องใช้ Diamond Block 1 บล็อก`,
});

export const FLAG_LABEL = Object.freeze({
   BREAK: 'ทำลายบล็อก',
   PLACE: 'วางบล็อก',
   INTERACT: 'ใช้งาน (ประตู/คันโยก)',
   CONTAINER: 'เปิด (หีบ/เตา)',
   DAMAGE: 'PvP ในโพรเทค',
});

// Message Templates
export const MSG = Object.freeze({
   FOOTER: '             @Sleeplite 2026',
   ZONE_CREATED: (size) => `[/] สร้างโพรเทค ${size}x${size} สำเร็จ`,
   ZONE_DELETED: '[/] ลบโพรเทคเรียบร้อย',
   NO_ZONE: '[x] คุณยังไม่ได้ตั้งค่าโพรเทค',
   NO_ZONES_SYSTEM: '[x] ยังไม่มีโพรเทคในระบบ',
   NO_ZONE_FOUND: '[x] ไม่พบโพรเทคดังกล่าว',
   NO_DIMENSION: '[x] โพรเทคไม่มีข้อมูลโลก',
   NEED_DIAMOND: '[x] คุณต้องมี Diamond Block ในช่องเก็บของ',
   OVERLAP: '[x] ตำแหน่งนี้ซ้อนทับกับโพรเทคอื่น',
   MEMBER_FULL: (max) => `[x] สมาชิกเต็มแล้ว (สูงสุด ${max} คน)`,
   ALREADY_MEMBER: '[x] ผู้เล่นนี้เป็นสมาชิกอยู่แล้ว',
   NOT_MEMBER: '[x] ผู้เล่นนี้ไม่ได้เป็นสมาชิก',
   MEMBER_ADDED: (name) => `[/] เพิ่ม ${name} เข้าเป็นสมาชิกแล้ว`,
   MEMBER_REMOVED: (name) => `[/] ลบ ${name} ออกจากสมาชิกแล้ว`,
   FLAGS_SET: '[/] ตั้งค่าสิทธิ์โพรเทคเรียบร้อย',
   ADMIN_ONLY: '[x] เฉพาะผู้ดูแลระบบเท่านั้น',
   ADMIN_DELETED: (owner) => `[/] ลบโพรเทคของ ${owner} แล้ว`,
   ADMIN_NOTIFY: '§cผู้ดูแลระบบลบโพรเทคของคุณแล้ว',
   TELEPORTED: (owner) => `[/] เทเลพอร์ตไปยังโพรเทคของ ${owner}`,
   FORM_INVALID: '[x] ฟอร์มไม่ถูกต้อง กรุณาลองใหม่',
   SELECTION_INVALID: '[x] การเลือกไม่ถูกต้อง กรุณาลองใหม่',
   MENU_ERROR: '[x] เมนูผิดพลาด',
   WAIT: '[x] กรุณารอสักครู่',
   BORDER_SHOW: null,
   BORDER_FAIL: '[x] แสดงขอบเขตโพรเทคไม่ได้',
});

// Colors (prefixes)
export const COLOR = Object.freeze({
   ERROR: '§c',
   SUCCESS: '§a',
   WARNING: '§6',
   INFO: '§7',
});

// Event Names
export const EVENT = Object.freeze({
   ITEM_USE: 'protection:itemUse',
   PLAYER_LEAVE: 'protection:playerLeave',
   CHAT: 'protection:chat',
});

// Command Strings
export const COMMAND = Object.freeze({
   DEBUG_JSON: '!json',
});

// Permission Levels
export const PERMISSION = Object.freeze({
   ADMIN: TAG.ADMIN,
});

// Zone Limits
export const LIMIT = Object.freeze({
   MAX_ZONES: 10,
   ZONE_SIZE: 30,
   MAX_FRIENDS: 4,
   CACHE_LIMIT: 1000,
   BORDER_CACHE_MAX: 100,
   CACHE_EVICT_COUNT: 64,
   CACHE_EVICT_DIVISOR: 4,
});

// Radius / Distance
export const RADIUS = Object.freeze({
   EXPLOSION: 8,
   EXPLOSION_CHECK: 8,
});

export const DISTANCE = Object.freeze({
});

// World Height Limits
export const WORLD_LIMIT = Object.freeze({
   MIN_Y: -63,
   MAX_Y: 319,
});

// Cooldown / Timeout Values (ticks)
export const TIMEOUT = Object.freeze({
   BORDER_DURATION: 60,
   BORDER_RENDER_INTERVAL: 40,
});

export const COOLDOWN = Object.freeze({
});

// System Tick Constants
export const TICK = Object.freeze({
   BORDER_RENDER: TIMEOUT.BORDER_RENDER_INTERVAL,
});

// Particle Step
export const PARTICLE_STEP = 3;

// Default Flags
export const DEFAULT_FLAGS = Object.freeze({
   break: true,
   place: true,
   interact: true,
   container: true,
   damage: false,
});

// Data Version
export const DATA_VERSION = 2;

// Default Settings
export const DEFAULT = Object.freeze({
   FLAGS: DEFAULT_FLAGS,
});

// World Property Names
export const WORLD_PROPERTY = Object.freeze({
});

// Runtime-computed values (re-exported from helpers for convenience)
export const halfZoneSize = LIMIT.ZONE_SIZE / 2;

// Edge offsets (runtime)
const buildEdgeOffsets = (size) => {
   const offsets = [];
   const zero = 0;
   const zoneSize = size;
   const axes = [zero, zoneSize];
   const axesLen = axes.length;

   for (let outerIndex = 0; outerIndex < axesLen; outerIndex++) {
      const fixedY = axes[outerIndex];
      for (let innerIndex = 0; innerIndex < axesLen; innerIndex++) {
         offsets.push(['x', zero, fixedY, axes[innerIndex]]);
      }
   }

   for (let outerIndex = 0; outerIndex < axesLen; outerIndex++) {
      const fixedX = axes[outerIndex];
      for (let innerIndex = 0; innerIndex < axesLen; innerIndex++) {
         offsets.push(['y', fixedX, zero, axes[innerIndex]]);
      }
   }

   for (let outerIndex = 0; outerIndex < axesLen; outerIndex++) {
      const fixedX = axes[outerIndex];
      for (let innerIndex = 0; innerIndex < axesLen; innerIndex++) {
         offsets.push(['z', fixedX, axes[innerIndex], zero]);
      }
   }

   return offsets;
};

export const edgeOffsets = buildEdgeOffsets(LIMIT.ZONE_SIZE);

export const Config = Object.freeze({
   MaxZones: LIMIT.MAX_ZONES,
   DefaultFlags: DEFAULT_FLAGS,
   ZoneSize: LIMIT.ZONE_SIZE,
   RequiredBlock: ID.DIAMOND_BLOCK,
   BorderDuration: TIMEOUT.BORDER_DURATION,
   ParticleId: ID.PARTICLE_BORDER,
   ParticleStep: PARTICLE_STEP,
   CacheLimit: LIMIT.CACHE_LIMIT,
   AdminTag: TAG.ADMIN,
   MaxFriends: LIMIT.MAX_FRIENDS,
   ExplosionRadius: RADIUS.EXPLOSION,
});

export const Colors = Object.freeze({
   Error: COLOR.ERROR,
   Success: COLOR.SUCCESS,
   Warning: COLOR.WARNING,
   Info: COLOR.INFO,
});
