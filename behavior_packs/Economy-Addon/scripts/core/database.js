import { world } from '@minecraft/server';

import { logError } from '../events/logger.js';

// prefix key ใน DynamicProperties
const DP_PREFIX = 'economy:shop:';

// null = ยังไม่โหลด, object = โหลดแล้ว
let _cache = null;

// index O(1): locKey→chestKey, playerName→Set<chestKey>
const _locIndex = new Map();
const _ownerIndex = new Map();

function _keyToDp(key) {
   return DP_PREFIX + key;
}

function _makeLocKey(dimId, x, y, z) {
   return `${dimId}|${x}|${y}|${z}`;
}

// สร้าง index ใหม่ทุกครั้งหลังโหลดข้อมูล
function _rebuildIndexes() {
   _locIndex.clear();
   _ownerIndex.clear();
   const db = _cache ?? {};
   for (const [key, record] of Object.entries(db)) {
      const pName = record.name?.player;
      if (pName) {
         if (!_ownerIndex.has(pName)) _ownerIndex.set(pName, new Set());
         _ownerIndex.get(pName).add(key);
      }
      if (record.loc) {
         _locIndex.set(_makeLocKey(record.loc.dim, record.loc.x, record.loc.y, record.loc.z), key);
      }
      if (record.pairedLoc) {
         _locIndex.set(_makeLocKey(record.pairedLoc.dim, record.pairedLoc.x, record.pairedLoc.y, record.pairedLoc.z), key);
      }
   }
}

// โหลดข้อมูลจาก DynamicProperties (ทำงานเฉพาะครั้งแรก)
function _load() {
   if (_cache !== null) return _cache;
   _cache = {};
   const ids = world.getDynamicPropertyIds();
   for (const id of ids) {
      if (!id.startsWith(DP_PREFIX)) continue;
      const raw = world.getDynamicProperty(id);
      if (typeof raw !== 'string' || raw.length === 0) continue;
      try {
         const record = JSON.parse(raw);
         _cache[id.slice(DP_PREFIX.length)] = record;
      } catch (error) {
         logError('ReadShop', 'Failed to parse shop record', error);
      }
   }
   _rebuildIndexes();
   return _cache;
}

export function makeLocKey(dimId, x, y, z) {
   return _makeLocKey(dimId, x, y, z);
}

export function getAll() {
   return _load();
}

export function getByLocation(locKey) {
   _load();
   const chestKey = _locIndex.get(locKey);
   if (chestKey === undefined) return null;
   const record = _cache[chestKey];
   if (!record || !record.loc) return null;
   return { key: chestKey, record };
}

export function getByPlayer(playerName) {
   _load();
   const keys = _ownerIndex.get(playerName);
   if (!keys || keys.size === 0) return [];
   const result = [];
   for (const k of keys) {
      const record = _cache[k];
      if (record) result.push({ key: k, ...record });
   }
   return result;
}

export function getByKey(key) {
   return _load()[key] ?? null;
}

export function countByPlayer(playerName) {
   _load();
   return _ownerIndex.get(playerName)?.size ?? 0;
}

export function addChest(key, data) {
   const db = _load();
   db[key] = data;
   world.setDynamicProperty(_keyToDp(key), JSON.stringify(data));
   const pName = data.name?.player;
   if (pName) {
      if (!_ownerIndex.has(pName)) _ownerIndex.set(pName, new Set());
      _ownerIndex.get(pName).add(key);
   }
   if (data.loc) {
      _locIndex.set(_makeLocKey(data.loc.dim, data.loc.x, data.loc.y, data.loc.z), key);
   }
   if (data.pairedLoc) {
      _locIndex.set(_makeLocKey(data.pairedLoc.dim, data.pairedLoc.x, data.pairedLoc.y, data.pairedLoc.z), key);
   }
}

// set DynamicProperty = undefined = ลบออกจาก world store จริง
export function removeChest(key) {
   const db = _load();
   const record = db[key];
   if (!record) return false;
   const pName = record.name?.player;
   if (pName) {
      const set = _ownerIndex.get(pName);
      if (set) {
         set.delete(key);
         if (set.size === 0) _ownerIndex.delete(pName);
      }
   }
   if (record.loc) _locIndex.delete(_makeLocKey(record.loc.dim, record.loc.x, record.loc.y, record.loc.z));
   if (record.pairedLoc) _locIndex.delete(_makeLocKey(record.pairedLoc.dim, record.pairedLoc.x, record.pairedLoc.y, record.pairedLoc.z));
   delete db[key];
   world.setDynamicProperty(_keyToDp(key), undefined);
   return true;
}

// sync index เฉพาะตอน name/loc เปลี่ยน (กรณีปกติแค่เปลี่ยนราคาไม่ต้อง)
export function updateChest(key, patch) {
   const db = _load();
   const record = db[key];
   if (!record) return false;
   const oldName = record.name?.player;
   const newName = patch.name?.player;
   const nameChanged = newName !== undefined && newName !== oldName;
   const locChanged = patch.loc !== undefined;

   if (nameChanged || locChanged) {
      if (nameChanged && oldName) {
         const set = _ownerIndex.get(oldName);
         if (set) {
            set.delete(key);
            if (set.size === 0) _ownerIndex.delete(oldName);
         }
      }
      if (locChanged && record.loc) _locIndex.delete(_makeLocKey(record.loc.dim, record.loc.x, record.loc.y, record.loc.z));
      if (locChanged && record.pairedLoc) _locIndex.delete(_makeLocKey(record.pairedLoc.dim, record.pairedLoc.x, record.pairedLoc.y, record.pairedLoc.z));

      Object.assign(record, patch);

      if (nameChanged && newName) {
         if (!_ownerIndex.has(newName)) _ownerIndex.set(newName, new Set());
         _ownerIndex.get(newName).add(key);
      }
      if (locChanged && record.loc) _locIndex.set(_makeLocKey(record.loc.dim, record.loc.x, record.loc.y, record.loc.z), key);
      if (locChanged && record.pairedLoc) _locIndex.set(_makeLocKey(record.pairedLoc.dim, record.pairedLoc.x, record.pairedLoc.y, record.pairedLoc.z), key);
   } else {
      Object.assign(record, patch);
   }

   world.setDynamicProperty(_keyToDp(key), JSON.stringify(record));
   return true;
}

export function clearAll() {
   const ids = world.getDynamicPropertyIds();
   for (const id of ids) {
      if (id.startsWith(DP_PREFIX)) {
         world.setDynamicProperty(id, undefined);
      }
   }
   _cache = {};
   _locIndex.clear();
   _ownerIndex.clear();
}

export function getDbSizeInfo() {
   _load();
   return {
      bytes: world.getDynamicPropertyTotalByteCount(),
      shopsCount: Object.keys(_cache ?? {}).length,
   };
}

// บังคับโหลดใหม่จาก DynamicProperties
export function reloadFromDisk() {
   _cache = null;
   _locIndex.clear();
   _ownerIndex.clear();
   _load();
}
