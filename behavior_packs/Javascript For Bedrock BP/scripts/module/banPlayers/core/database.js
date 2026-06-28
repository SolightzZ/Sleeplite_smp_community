import { world } from '@minecraft/server';
import { logError } from '../../../events/logger.js';
import { Config } from '../config.js';
import { BanState } from './state.js';

export class BanDatabase {
   static load() {
      try {
         const data = world.getDynamicProperty(Config.dbKey);
         if (!data) return {};
         const parsed = JSON.parse(data);

         if (typeof parsed !== 'object' || parsed === null) return {};

         const now = Math.floor(Date.now() / 1000);
         const cleanData = {};

         for (const [name, entry] of Object.entries(parsed)) {
            if (entry.duration === 0 || entry.expiresAt > now) {
               cleanData[name] = entry;
            }
         }

         if (Object.keys(cleanData).length !== Object.keys(parsed).length) {
            world.setDynamicProperty(Config.dbKey, JSON.stringify(cleanData));
         }

         BanState.rebuildCache(cleanData);
         return cleanData;
      } catch (error) {
         logError('BanDB', 'Load error', error);
         return {};
      }
   }

   static save(data) {
      try {
         world.setDynamicProperty(Config.dbKey, JSON.stringify(data));
         BanState.markDirty();
      } catch (error) {
         logError('BanDB', 'Save error', error);
      }
   }

   static add(name, reason, duration, adminName) {
      const data = this.load();
      const now = Math.floor(Date.now() / 1000);
      data[name] = {
         reason,
         duration,
         bannedAt: now,
         expiresAt: duration === 0 ? 0 : now + duration,
         bannedBy: adminName,
      };
      this.save(data);
   }

   static remove(name) {
      const data = this.load();

      if (!data[name]) return false;
      delete data[name];
      this.save(data);

      return true;
   }

   static get(name) {
      const data = this.load();
      return data[name] ?? null;
   }

   static getAll() {
      this.load();
      return BanState.getAllBans();
   }

   static isBanned(name) {
      if (BanState.isDirty()) this.load();
      return BanState.isBanned(name);
   }
}
