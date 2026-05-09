import { world } from "@minecraft/server";
import { Colors, Config } from "../config.js";

const STORAGE_KEY = "ZONE_DATA";
const MAX_STORAGE_SIZE = 32768;

const isValidNumber = (n) => typeof n === "number";

export class ZoneDatabase {
  constructor() {
    this.zones = {};
    this.cache = new Map();
  }

  save() {
    try {
      const owners = Object.keys(this.zones);
      const ownersLen = owners.length;
      const compressed = [];

      for (let i = 0; i < ownersLen; i++) {
        const owner = owners[i];
        const zone = this.zones[owner];
        compressed.push([
          owner,
          [
            zone.start.x,
            zone.start.y,
            zone.start.z,
            zone.end.x,
            zone.end.y,
            zone.end.z,
            ...zone.friends,
          ],
        ]);
      }

      const json = JSON.stringify(compressed);
      if (json.length > MAX_STORAGE_SIZE) throw new Error("Data exceeds 32KB");
      world.setDynamicProperty(STORAGE_KEY, json);
    } catch (err) {
      console.warn(`${Colors.Error}Zone save failed: ${err}`);
    }
  }

  load() {
    try {
      this.zones = {};
      this.cache.clear();

      const json = world.getDynamicProperty(STORAGE_KEY);
      if (!json || typeof json !== "string") return;

      const parsed = JSON.parse(json);
      if (!Array.isArray(parsed)) return;

      const parsedLen = parsed.length;
      for (let i = 0; i < parsedLen; i++) {
        const entry = parsed[i];
        if (!Array.isArray(entry) || entry.length < 2) continue;

        const owner = entry[0];
        const packed = entry[1];
        if (
          typeof owner !== "string" ||
          !Array.isArray(packed) ||
          packed.length < 6
        )
          continue;

        const sx = packed[0];
        const sy = packed[1];
        const sz = packed[2];
        const ex = packed[3];
        const ey = packed[4];
        const ez = packed[5];

        if (
          !isValidNumber(sx) ||
          !isValidNumber(sy) ||
          !isValidNumber(sz) ||
          !isValidNumber(ex) ||
          !isValidNumber(ey) ||
          !isValidNumber(ez)
        )
          continue;

        const friends = [];
        const friendsStart = 6;
        const packedLen = packed.length;
        for (let j = friendsStart; j < packedLen; j++) {
          const f = packed[j];
          if (typeof f === "string") friends.push(f);
        }

        this.zones[owner] = {
          start: { x: sx, y: sy, z: sz },
          end: { x: ex, y: ey, z: ez },
          friends: friends,
        };
      }
    } catch (err) {
      console.warn(`${Colors.Error}Zone load failed: ${err}`);
      this.zones = {};
      this.cache.clear();
    }
  }

  makeKey(loc) {
    return `${Math.floor(loc.x)},${Math.floor(loc.y)},${Math.floor(loc.z)}`;
  }

  findByLocation(loc) {
    const key = this.makeKey(loc);
    if (this.cache.has(key)) return this.cache.get(key);

    const owners = Object.keys(this.zones);
    const ownersLen = owners.length;

    for (let i = 0; i < ownersLen; i++) {
      const zone = this.zones[owners[i]];
      if (
        loc.x >= zone.start.x &&
        loc.x <= zone.end.x &&
        loc.y >= zone.start.y &&
        loc.y <= zone.end.y &&
        loc.z >= zone.start.z &&
        loc.z <= zone.end.z
      ) {
        if (this.cache.size > Config.CacheLimit) this.cache.clear();
        const result = { owner: owners[i], ...zone };
        this.cache.set(key, result);
        return result;
      }
    }

    this.cache.set(key, null);
    return null;
  }
}

export const zoneDatabase = new ZoneDatabase();
