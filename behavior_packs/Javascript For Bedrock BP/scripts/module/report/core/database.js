import { logError, logWarn } from '../../../events/logger.js';
import { CONFIG } from '../config.js';
import { formatThaiDateTime } from '../../../shared/datetime.js';
import { Database } from '../../../shared/database.js';

const validate = (value, label) => {
   if (typeof value !== 'string' || value.trim() === '') {
      logWarn('ReportDB', `${label} validation failed: empty or invalid`);
      return false;
   }
   return true;
};

let cachedData = null;

export class ReportDatabase {
   static load() {
      if (cachedData !== null) return cachedData;
      cachedData = Database.loadGlobal(CONFIG.dbKey, {});
      return cachedData;
   }

   static save(data) {
      cachedData = data;
      try {
         Database.saveGlobal(CONFIG.dbKey, data);
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
            logWarn('ReportDB', `Max reports (${CONFIG.maxReports}) reached for ${name}`);
            return;
         }
         data[name].push({ t: title.trim(), b: body.trim(), d: formatThaiDateTime(), r: '' });
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
            data[name][index].d = formatThaiDateTime() + ' (edit)';
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
