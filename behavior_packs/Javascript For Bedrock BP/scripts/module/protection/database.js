import { world } from "@minecraft/server";
import { Configuration, TextColorCodes } from "./constants.js";

export class ZoneDatabase {
  constructor() {
    this.zoneByOwnerName = {};
    this.locationToZoneCache = new Map();
  }

  saveAllZonesToStorage() {
    try {
      const compressed = Object.entries(this.zoneByOwnerName).map(([ownerName, { start, end, friends }]) => [
        ownerName,
        [start.x, start.y, start.z, end.x, end.y, end.z, ...(friends?.length ? friends : [])],
      ]);
      const json = JSON.stringify(compressed);
      if (json.length > 32768) throw new Error("ข้อมูลโซนเกิน 32KB (Dynamic Property จำกัด)");
      world.setDynamicProperty("ZONE_DATA", json);
    } catch (error) {
      console.warn(`${TextColorCodes.Error}Error saveAllZonesToStorage: ${error}`);
    }
  }

  loadAllZonesFromStorage() {
    try {
      const json = world.getDynamicProperty("ZONE_DATA");
      this.zoneByOwnerName = {};
      this.locationToZoneCache.clear();
      if (!json || typeof json !== "string") return;

      const parsed = JSON.parse(json);
      if (!Array.isArray(parsed)) throw new Error("รูปแบบข้อมูลไม่ถูกต้อง");

      for (const [ownerName, packed] of parsed) {
        if (typeof ownerName !== "string" || !Array.isArray(packed) || packed.length < 6) continue;
        const [sx, sy, sz, ex, ey, ez, ...friendList] = packed;
        if ([sx, sy, sz, ex, ey, ez].some((n) => typeof n !== "number")) continue;

        this.zoneByOwnerName[ownerName] = {
          start: { x: sx, y: sy, z: sz },
          end: { x: ex, y: ey, z: ez },
          friends: friendList.filter((n) => typeof n === "string"),
        };
      }
    } catch (error) {
      console.warn(`${TextColorCodes.Error}Error loadAllZonesFromStorage: ${error}`);
      this.zoneByOwnerName = {};
      this.locationToZoneCache.clear();
    }
  }

  _locationKey(location) {
    return `${Math.floor(location.x)},${Math.floor(location.y)},${Math.floor(location.z)}`;
  }

  findZoneByLocation(location) {
    const key = this._locationKey(location);
    if (this.locationToZoneCache.has(key)) return this.locationToZoneCache.get(key);

    for (const [ownerName, zone] of Object.entries(this.zoneByOwnerName)) {
      if (
        location.x >= zone.start.x &&
        location.x <= zone.end.x &&
        location.y >= zone.start.y &&
        location.y <= zone.end.y &&
        location.z >= zone.start.z &&
        location.z <= zone.end.z
      ) {
        if (this.locationToZoneCache.size > Configuration.LocationCacheLimit) this.locationToZoneCache.clear();
        const zoneData = { ownerName, ...zone };
        this.locationToZoneCache.set(key, zoneData);
        return zoneData;
      }
    }
    this.locationToZoneCache.set(key, null);
    return null;
  }
}
