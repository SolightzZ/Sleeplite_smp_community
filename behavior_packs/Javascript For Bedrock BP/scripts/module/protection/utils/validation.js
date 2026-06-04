import { ItemStack } from '@minecraft/server';
import { Config, EdgeOffsets, HalfZoneSize } from '../config.js';

const borderCache = new Map();

const CONTAINER_BLOCKS = new Set([
    'minecraft:chest',
    'minecraft:trapped_chest',
    'minecraft:barrel',
    'minecraft:furnace',
    'minecraft:blast_furnace',
    'minecraft:smoker',
    'minecraft:hopper',
    'minecraft:dropper',
    'minecraft:dispenser',
    'minecraft:brewing_stand',
    'minecraft:shulker_box',
    'minecraft:undyed_shulker_box',
]);

export const hasAccess = (player, zone) => {
    if (player.name === zone.owner) return true;
    if (player.hasTag(Config.AdminTag)) return true;
    return zone.members?.includes(player.name) ?? false;
};

export const isContainerBlock = (typeId) => CONTAINER_BLOCKS.has(typeId);

export const validateZoneCreate = (player, zones) => {
    const zoneCount = Object.keys(zones).length;
    if (zoneCount >= Config.MaxZones) {
        return { ok: false, reason: `[x] มีโพรเทคครบ ${Config.MaxZones} อันแล้ว` };
    }
    if (zones[player.name]) {
        return { ok: false, reason: `[x] คุณมีโพรเทคอยู่แล้ว` };
    }

    const base = {
        x: Math.floor(player.location.x),
        y: Math.floor(player.location.y) - 1,
        z: Math.floor(player.location.z),
    };
    const bottom = base.y - HalfZoneSize;
    const top = base.y + HalfZoneSize;
    if (bottom < -63 || top > 319) {
        return { ok: false, reason: `[x] ตำแหน่งนี้อยู่นอกขอบเขตความสูงที่กำหนด` };
    }

    return { ok: true, center: base, dimension: player.dimension.id };
};

export const consumeBlock = (player) => {
    const container = player.getComponent('minecraft:inventory')?.container;
    if (!container) return false;
    const size = container.size;
    for (let i = 0; i < size; i++) {
        const item = container.getItem(i);
        if (item && item.typeId === Config.RequiredBlock) {
            if (item.amount > 1) {
                container.setItem(i, new ItemStack(Config.RequiredBlock, item.amount - 1));
            } else {
                container.setItem(i, undefined);
            }
            return true;
        }
    }
    return false;
};

export const isOverlapping = (a, b) => {
    return a.start.x <= b.end.x && a.end.x >= b.start.x && a.start.y <= b.end.y && a.end.y >= b.start.y && a.start.z <= b.end.z && a.end.z >= b.start.z;
};

export const isZoneOverlap = (newZone, zones) => {
    for (const z of Object.values(zones)) {
        if (z.dimension !== newZone.dimension) continue;
        if (isOverlapping(newZone, z)) return true;
    }
    return false;
};

export const buildZone = (center, dimension) => {
    const h = HalfZoneSize;
    const start = { x: center.x - h, y: center.y - h, z: center.z - h };
    const end = { x: center.x + h, y: center.y + h, z: center.z + h };
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

export const isFormValid = (player, response) => {
    if (response.canceled) return false;
    const hasValues = 'formValues' in response;
    const valuesOk = response.formValues && Array.isArray(response.formValues);
    if (hasValues && !valuesOk) {
        player.sendMessage(`[x] ฟอร์มไม่ถูกต้อง กรุณาลองใหม่`);
        return false;
    }
    return true;
};

export const buildBorderPoints = (start, step) => {
    const key = `${start.x},${start.y},${start.z},${step}`;
    const cached = borderCache.get(key);
    if (cached) return cached;

    const points = [];

    for (const offset of EdgeOffsets) {
        const axis = offset[0];
        const offX = offset[1];
        const offY = offset[2];
        const offZ = offset[3];

        for (let d = 0; d <= Config.ZoneSize; d += step) {
            const p = { x: start.x + offX, y: start.y + offY, z: start.z + offZ };
            if (axis === 'x') p.x += d;
            if (axis === 'y') p.y += d;
            if (axis === 'z') p.z += d;
            points.push({ x: p.x + 0.5, y: p.y + 0.5, z: p.z + 0.5 });
        }
    }

    borderCache.set(key, points);
    return points;
};
