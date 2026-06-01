import { world } from '@minecraft/server';
import { CONFIG } from '../config.js';
import { getTime } from '../utils/date.js';

export class Database {
    static load() {
        try {
            const data = world.getDynamicProperty(CONFIG.dbKey);
            if (!data) return {};
            return JSON.parse(data);
        } catch (e) {
            console.warn('[DB Load Error]: ' + e);
            return {};
        }
    }

    static save(data) {
        try {
            world.setDynamicProperty(CONFIG.dbKey, JSON.stringify(data));
        } catch (e) {
            console.warn('[DB Save Error]: ' + e);
        }
    }

    static add(name, title, body) {
        try {
            const db = this.load();
            if (!db[name]) db[name] = [];
            db[name].push({ t: title, b: body, d: getTime(), r: '' });
            this.save(db);
        } catch (e) {
            console.warn('[DB Add Error]: ' + e);
        }
    }

    static update(name, index, title, body) {
        try {
            const db = this.load();
            if (db[name] && db[name][index]) {
                db[name][index].t = title;
                db[name][index].b = body;
                db[name][index].d = getTime() + ' (edit)';
                this.save(db);
            }
        } catch (e) {
            console.warn('[DB Update Error]: ' + e);
        }
    }

    static delete(name, index) {
        try {
            const db = this.load();
            if (db[name]) {
                db[name].splice(index, 1);
                if (db[name].length === 0) delete db[name];
                this.save(db);
            }
        } catch (e) {
            console.warn('[DB Delete Error]: ' + e);
        }
    }

    static reply(name, index, text) {
        try {
            const db = this.load();
            if (db[name] && db[name][index]) {
                db[name][index].r = text;
                this.save(db);
            }
        } catch (e) {
            console.warn('[DB Reply Error]: ' + e);
        }
    }

    static get(name) {
        try {
            const db = this.load();
            return db[name] || [];
        } catch (e) {
            console.warn('[DB Get Error]: ' + e);
            return [];
        }
    }

    static getAll() {
        return this.load();
    }
}
