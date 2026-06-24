import { system, world } from '@minecraft/server';

import { logError } from '../../../router/core/logger.js';
import { Config } from '../config.js';

// ค่าคงที่
const STORAGE_KEY = 'ZONE_DATA';
const MAX_STORAGE_SIZE = 32768;

// ตัวช่วยรูปแบบข้อมูลจัดเก็บ
const parseStorageFormat = (raw) => {
   if (Array.isArray(raw)) return raw;
   if (raw && typeof raw === 'object') {
      if (raw.version === 2 && Array.isArray(raw.zones)) return raw.zones;
      if (raw.version === 1 && Array.isArray(raw.zones)) return raw.zones;
   }
   return null;
};

const convertLegacyV1 = (owner, packedData) => {
   const [startX, startY, startZ, endX, endY, endZ] = packedData;

   const memberNames = [];
   for (let index = 6; index < packedData.length; index++) {
      if (typeof packedData[index] === 'string') memberNames.push(packedData[index]);
   }

   const center = {
      x: Math.floor((startX + endX) / 2),
      y: Math.floor((startY + endY) / 2),
      z: Math.floor((startZ + endZ) / 2),
   };

   return {
      id: `minecraft:overworld:${center.x},${center.y},${center.z}`,
      dimension: 'minecraft:overworld',
      location: { ...center },
      start: { x: startX, y: startY, z: startZ },
      end: { x: endX, y: endY, z: endZ },
      owner,
      members: memberNames,
      flags: { ...Config.DefaultFlags },
   };
};

const normalizeZoneEntry = (entry) => ({
   id: entry.id || `${entry.dimension}:${entry.location?.x || 0},${entry.location?.y || 0},${entry.location?.z || 0}`,
   dimension: entry.dimension,
   location: entry.location || { x: 0, y: 0, z: 0 },
   start: entry.start,
   end: entry.end,
   owner: entry.owner,
   members: Array.isArray(entry.members) ? entry.members : [],
   flags: entry.flags ? { ...Config.DefaultFlags, ...entry.flags } : { ...Config.DefaultFlags },
});

// ตัวช่วยบันทึกอัตโนมัติ Proxy
const wrapArray = (arr, saveFn) =>
   new Proxy(arr, {
      set(target, prop, value) {
         target[prop] = value;
         saveFn();
         return true;
      },
   });

const wrapZone = (zoneData, saveFn) => {
   zoneData.members = wrapArray(zoneData.members || [], saveFn);
   return new Proxy(zoneData, {
      set(target, prop, value) {
         target[prop] = prop === 'members' ? wrapArray(value, saveFn) : value;
         saveFn();
         return true;
      },
      deleteProperty(target, prop) {
         delete target[prop];
         saveFn();
         return true;
      },
   });
};

const buildZonesProxy = (data, saveFn) =>
   new Proxy(data, {
      set(target, prop, value) {
         target[prop] = typeof value === 'object' && value !== null ? wrapZone(value, saveFn) : value;
         saveFn();
         return true;
      },
      deleteProperty(target, prop) {
         delete target[prop];
         saveFn();
         return true;
      },
   });

// คลาส ZoneDatabase
export class ZoneDatabase {
   constructor() {
      this._data = {};
      this.cache = new Map();
      this._saveScheduled = false;
      this.zones = buildZonesProxy(this._data, () => this.scheduleSave());
   }

   scheduleSave() {
      // ล้างแคชทันทีเพื่อป้องกันไม่ให้คำสั่งค้นหาค้างอยู่
      this.cache.clear();
      if (this._saveScheduled) return;
      this._saveScheduled = true;
      system.run(() => {
         this._saveScheduled = false;
         this.save();
      });
   }

   save() {
      try {
         const zones = Object.keys(this._data).map((ownerName) => ({ ...this._data[ownerName] }));
         const payload = { version: 2, zones };
         const json = JSON.stringify(payload);
         if (json.length > MAX_STORAGE_SIZE) throw new Error('Data exceeds 32KB');
         world.setDynamicProperty(STORAGE_KEY, json);
      } catch (error) {
         logError('Protection', 'Save failed', error);
      }
   }

   load() {
      try {
         this._data = {};
         this.zones = buildZonesProxy(this._data, () => this.scheduleSave());
         this.cache.clear();

         const json = world.getDynamicProperty(STORAGE_KEY);
         if (!json || typeof json !== 'string') return;

         const zonesData = parseStorageFormat(JSON.parse(json));
         if (!zonesData) return;

         const saveFn = () => this.save();

         for (const entry of zonesData) {
            if (Array.isArray(entry)) {
               const [owner, packedZoneData] = entry;
               if (typeof owner !== 'string' || !Array.isArray(packedZoneData) || packedZoneData.length < 6) continue;
               this._data[owner] = wrapZone(convertLegacyV1(owner, packedZoneData), saveFn);
            } else if (entry?.owner && entry?.start && entry?.end && entry?.dimension) {
               this._data[entry.owner] = wrapZone(normalizeZoneEntry(entry), saveFn);
            }
         }
      } catch (error) {
         logError('Protection', 'Load failed', error);
         this._data = {};
         this.cache.clear();
      }
   }

   makeKey(location, dimensionId) {
      return `${dimensionId}:${Math.floor(location.x)},${Math.floor(location.y)},${Math.floor(location.z)}`;
   }

   findByLocation(location, dimensionId) {
      const cacheKey = this.makeKey(location, dimensionId);
      if (this.cache.has(cacheKey)) return this.cache.get(cacheKey);

      for (const zone of Object.values(this._data)) {
         if (zone.dimension !== dimensionId) continue;
         if (location.x >= zone.start.x && location.x <= zone.end.x && location.y >= zone.start.y && location.y <= zone.end.y && location.z >= zone.start.z && location.z <= zone.end.z) {
            if (this.cache.size > Config.CacheLimit) {
               const iter = this.cache.keys();
               const evictCount = Math.min(64, this.cache.size >> 2);
               for (let i = 0; i < evictCount; i++) {
                  const key = iter.next().value;
                  if (key === undefined) break;
                  this.cache.delete(key);
               }
            }
            this.cache.set(cacheKey, zone);
            return zone;
         }
      }

      this.cache.set(cacheKey, null);
      return null;
   }
}

export const zoneDatabase = new ZoneDatabase();
