import { world } from '@minecraft/server';
import { Config } from '../config.js';

const STORAGE_KEY = 'ZONE_DATA';
const MAX_STORAGE_SIZE = 32768;

const oldToV2 = (owner, packed) => {
    const sx = packed[0],
        sy = packed[1],
        sz = packed[2];
    const ex = packed[3],
        ey = packed[4],
        ez = packed[5];
    const friends = [];
    for (let j = 6; j < packed.length; j++) {
        if (typeof packed[j] === 'string') friends.push(packed[j]);
    }
    const center = {
        x: Math.floor((sx + ex) / 2),
        y: Math.floor((sy + ey) / 2),
        z: Math.floor((sz + ez) / 2),
    };
    return {
        id: `minecraft:overworld:${center.x},${center.y},${center.z}`,
        dimension: 'minecraft:overworld',
        location: { ...center },
        start: { x: sx, y: sy, z: sz },
        end: { x: ex, y: ey, z: ez },
        owner,
        members: friends,
        flags: { ...Config.DefaultFlags },
    };
};

export class ZoneDatabase {
    constructor() {
        this.zones = {};
        this.cache = new Map();
    }

    save() {
        try {
            const zones = [];
            for (const key of Object.keys(this.zones)) {
                zones.push({ ...this.zones[key] });
            }
            const payload = { version: 2, zones };
            const json = JSON.stringify(payload);
            if (json.length > MAX_STORAGE_SIZE) throw new Error('Data exceeds 32KB');
            world.setDynamicProperty(STORAGE_KEY, json);
        } catch (err) {
            console.warn(`[ Protection ] Zone save failed: ${err}`);
        }
    }

    load() {
        try {
            this.zones = {};
            this.cache.clear();

            const json = world.getDynamicProperty(STORAGE_KEY);
            if (!json || typeof json !== 'string') return;

            const parsed = JSON.parse(json);

            let raw;
            if (Array.isArray(parsed)) {
                raw = parsed;
            } else if (parsed && parsed.version === 1 && Array.isArray(parsed.zones)) {
                raw = parsed.zones;
            } else if (parsed && parsed.version === 2 && Array.isArray(parsed.zones)) {
                raw = parsed.zones;
            } else {
                return;
            }

            for (const entry of raw) {
                if (Array.isArray(entry)) {
                    const [owner, packed] = entry;
                    if (typeof owner !== 'string' || !Array.isArray(packed) || packed.length < 6) continue;
                    const zone = oldToV2(owner, packed);
                    this.zones[zone.owner] = zone;
                } else if (entry && typeof entry === 'object' && entry.owner && entry.start && entry.end && entry.dimension) {
                    this.zones[entry.owner] = {
                        id: entry.id || `${entry.dimension}:${entry.location?.x || 0},${entry.location?.y || 0},${entry.location?.z || 0}`,
                        dimension: entry.dimension,
                        location: entry.location || { x: 0, y: 0, z: 0 },
                        start: entry.start,
                        end: entry.end,
                        owner: entry.owner,
                        members: Array.isArray(entry.members) ? entry.members : [],
                        flags: entry.flags ? { ...Config.DefaultFlags, ...entry.flags } : { ...Config.DefaultFlags },
                    };
                }
            }
        } catch (err) {
            console.warn(`[ Protection ] Zone load failed: ${err}`);
            this.zones = {};
            this.cache.clear();
        }
    }

    makeKey(loc, dimensionId) {
        return `${dimensionId}:${Math.floor(loc.x)},${Math.floor(loc.y)},${Math.floor(loc.z)}`;
    }

    findByLocation(loc, dimensionId) {
        const key = this.makeKey(loc, dimensionId);
        if (this.cache.has(key)) return this.cache.get(key);

        for (const zone of Object.values(this.zones)) {
            if (zone.dimension !== dimensionId) continue;
            if (loc.x >= zone.start.x && loc.x <= zone.end.x && loc.y >= zone.start.y && loc.y <= zone.end.y && loc.z >= zone.start.z && loc.z <= zone.end.z) {
                if (this.cache.size > Config.CacheLimit) this.cache.clear();
                this.cache.set(key, zone);
                return zone;
            }
        }

        this.cache.set(key, null);
        return null;
    }
}

export const zoneDatabase = new ZoneDatabase();
