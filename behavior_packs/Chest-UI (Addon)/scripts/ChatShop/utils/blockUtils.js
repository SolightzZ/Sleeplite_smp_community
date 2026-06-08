import { world } from '@minecraft/server';
import shopDatabase from '../data/database.js';
import { coordinateKey, currentTimestamp } from './helpers.js';

export function getContainer(shop) {
    try {
        const dimension = world.getDimension(shop.dimension);

        if (!dimension) return null;

        const block = dimension.getBlock(shop.location);

        if (!block) return null;

        return block.getComponent('minecraft:inventory')?.container ?? null;
    } catch (error) {
        console.error('[Shop] getContainer:', error);
        return null;
    }
}

export function clearContainer(shop) {
    try {
        const container = getContainer(shop);

        if (!container) return;

        Array.from({ length: container.size }).forEach((_, i) => {
            container.setItem(i, undefined);
        });
    } catch (error) {
        console.error('[Shop] clearContainer:', error);
    }
}

export function spawnItemStack(shop, itemStack) {
    try {
        const dimension = world.getDimension(shop.dimension);

        if (!dimension) return;

        const { x, y, z } = shop.location;

        const location = { x: x + 0.5, y: y + 0.5, z: z + 0.5 };

        dimension.spawnItem(itemStack, location);
    } catch (error) {
        console.error('[Shop] spawnItemStack:', error);
    }
}

function archiveDeletedShop(shop) {
    const data = shopDatabase.data;

    if (!data.deletedShops) data.deletedShops = {};

    const archiveEntry = {
        ...shop,
        deletedAt: currentTimestamp(),
        archived: true,
    };

    if (archiveEntry.stats) delete archiveEntry.stats;

    if (archiveEntry.container && archiveEntry.container.containerHash !== undefined) {
        delete archiveEntry.container.containerHash;
    }

    // ปรับขนาดฐานข้อมูลให้เหมาะสม: จำกัดจำนวนประวัติการขายในไฟล์เก็บถาวรเพื่อป้องกันการใช้หน่วยความจำมากเกินไปเมื่อเวลาผ่านไป
    if (Array.isArray(archiveEntry.salesHistory)) {
        archiveEntry.salesHistory = archiveEntry.salesHistory.slice(-5);
    }

    data.deletedShops[shop.shopId] = archiveEntry;
}

export function deleteShop(shopId) {
    try {
        const data = shopDatabase.data;

        const shop = data.shops[shopId];

        if (!shop) {
            console.error(`[Shop] deleteShop: shop ${shopId} not found`);
            return;
        }

        clearContainer(shop);

        archiveDeletedShop(shop);

        const key = coordinateKey(shop.location.x, shop.location.y, shop.location.z);

        delete data.protectedBlocks[key];

        delete data.shops[shopId];

        shopDatabase.save();
    } catch (error) {
        console.error('[Shop] deleteShop error:', error);
    }
}
