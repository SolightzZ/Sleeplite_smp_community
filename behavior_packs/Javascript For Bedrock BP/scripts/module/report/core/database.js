import { world } from '@minecraft/server';
import { CONFIG } from '../config.js';
import { getTime } from '../utils/date.js';

const validate = (value, label) => {
    if (typeof value !== 'string' || value.trim() === '') {
        console.warn(`[DB] ${label} validation failed: empty or invalid`);
        return false;
    }
    return true;
};

export class Database {
    static load() {
        try {
            const data = world.getDynamicProperty(CONFIG.dbKey);
            if (!data) return {};
            return JSON.parse(data);
        } catch (error) {
            console.error('[DB] Load Error: ' + error);
            return {};
        }
    }

    static save(data) {
        try {
            world.setDynamicProperty(CONFIG.dbKey, JSON.stringify(data));
        } catch (error) {
            console.error('[DB] Save Error: ' + error);
        }
    }

    static add(name, title, body) {
        if (!validate(name, 'name') || !validate(title, 'title') || !validate(body, 'body')) return;
        try {
            const data = this.load();
            if (!data[name]) data[name] = [];
            data[name].push({ t: title.trim(), b: body.trim(), d: getTime(), r: '' });
            this.save(data);
        } catch (error) {
            console.error('[DB] Add Error: ' + error);
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
            console.error('[DB] Update Error: ' + error);
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
            console.error('[DB] Delete Error: ' + error);
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
            console.error('[DB] Reply Error: ' + error);
        }
    }

    static get(name) {
        try {
            const data = this.load();
            return data[name] || [];
        } catch (error) {
            console.error('[DB] Get Error: ' + error);
            return [];
        }
    }

    static getAll() {
        return this.load();
    }
}
