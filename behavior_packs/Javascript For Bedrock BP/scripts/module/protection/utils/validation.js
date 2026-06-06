import { Config, halfZoneSize } from '../config.js';

// ตรวจสอบการสร้างโซน
export const validateZoneCreate = (player, zones) => {
    const zoneCount = Object.keys(zones).length;
    if (zoneCount >= Config.MaxZones) {
        return { ok: false, reason: `[x] มีโพรเทคครบ ${Config.MaxZones} แล้ว` };
    }
    if (zones[player.name]) {
        return { ok: false, reason: `[x] คุณมีโพรเทคอยู่แล้ว` };
    }

    const basePosition = {
        x: Math.floor(player.location.x),
        y: Math.floor(player.location.y) + 1,
        z: Math.floor(player.location.z),
    };

    const bottom = basePosition.y - halfZoneSize;
    const top = basePosition.y + halfZoneSize;
    if (bottom < -63 || top > 319) {
        return { ok: false, reason: `[x] ตำแหน่งนี้อยู่นอกขอบเขตความสูงที่กำหนด` };
    }

    return { ok: true, center: basePosition, dimension: player.dimension.id };
};

// เรขาคณิตโซน
export const isOverlapping = (zoneA, zoneB) => {
    return zoneA.start.x <= zoneB.end.x && zoneA.end.x >= zoneB.start.x && zoneA.start.y <= zoneB.end.y && zoneA.end.y >= zoneB.start.y && zoneA.start.z <= zoneB.end.z && zoneA.end.z >= zoneB.start.z;
};

export const isZoneOverlap = (newZone, zones) => {
    for (const zone of Object.values(zones)) {
        if (zone.dimension !== newZone.dimension) continue;
        if (isOverlapping(newZone, zone)) return true;
    }
    return false;
};

export const buildZone = (center, dimension) => {
    const halfSize = halfZoneSize;
    const start = { x: center.x - halfSize, y: center.y - halfSize, z: center.z - halfSize };
    const end = { x: center.x + halfSize, y: center.y + halfSize, z: center.z + halfSize };
    return {
        id: `${dimension}:${center.x},${center.y},${center.z}`,
        dimension,
        location: { ...center },
        start,
        end,
        owner: '',
        members: [],
        flags: { ...Config.DefaultFlags },
    };
};
