import { world } from '@minecraft/server';

import { logError } from '../../../router/core/logger.js';
import { CONFIG } from '../config.js';
import { getTime } from '../utils/date.js';

const validate = (value, label) => {
   if (typeof value !== 'string' || value.trim() === '') {
      console.warn(`[DB] ${label} validation failed: empty or invalid`);
      return false;
   }
   return true;
};

let cachedData = null;

export class Database {
   static load() {
      if (cachedData !== null) return cachedData;
      try {
         const data = world.getDynamicProperty(CONFIG.dbKey);
         if (!data) {
            cachedData = {};
         } else {
            cachedData = JSON.parse(data);
         }
      } catch (error) {
         logError('DB', 'Load Error', error);
         cachedData = {};
      }
      return cachedData;
   }

   static save(data) {
      cachedData = data;
      try {
         world.setDynamicProperty(CONFIG.dbKey, JSON.stringify(data));
      } catch (error) {
         logError('DB', 'Save Error', error);
      }
   }

   static add(name, title, body) {
      if (!validate(name, 'name') || !validate(title, 'title') || !validate(body, 'body')) return;
      try {
         const data = this.load();
         if (!data[name]) data[name] = [];
         if (data[name].length >= CONFIG.maxReports) {
            console.warn(`[DB] Max reports (${CONFIG.maxReports}) reached for ${name}`);
            return;
         }
         data[name].push({ t: title.trim(), b: body.trim(), d: getTime(), r: '' });
         this.save(data);
      } catch (error) {
         logError('DB', 'Add Error', error);
      }
   }

   static update(name, index, title, body) {
      if (!validate(title, 'title') || !validate(body, 'body')) return;
      try {
         const data = this.load();
         if (data[name] && data[name][index]) {
            data[name][index].t = title.trim();
            data[name][index].b = body.trim();
            data[name][index].d = getTime() + ' (edit)';
            this.save(data);
         }
      } catch (error) {
         logError('DB', 'Update Error', error);
      }
   }

   static delete(name, index) {
      try {
         const data = this.load();
         if (data[name]) {
            data[name].splice(index, 1);
            if (data[name].length === 0) delete data[name];
            this.save(data);
         }
      } catch (error) {
         logError('DB', 'Delete Error', error);
      }
   }

   static reply(name, index, text) {
      if (!validate(text, 'reply')) return;
      try {
         const data = this.load();
         if (data[name] && data[name][index]) {
            data[name][index].r = text.trim();
            this.save(data);
         }
      } catch (error) {
         logError('DB', 'Reply Error', error);
      }
   }

   static get(name) {
      try {
         const data = this.load();
         return data[name] || [];
      } catch (error) {
         logError('DB', 'Get Error', error);
         return [];
      }
   }

   static getAll() {
      return this.load();
   }
}
