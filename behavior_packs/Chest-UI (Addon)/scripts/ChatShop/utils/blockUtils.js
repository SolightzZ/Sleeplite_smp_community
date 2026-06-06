import { ItemStack, world } from '@minecraft/server';
import shopDatabase from '../core/database.js';
import helpers from './helpers.js';

class BlockUtils {
    getContainer = (shop) => {
        try {
            const dim = world.getDimension(shop.dimension);
            if (!dim) return null;

            const block = dim.getBlock(shop.location);
            if (!block) return null;

            return block.getComponent('minecraft:inventory')?.container ?? null;
        } catch (error) {
            console.error('[ Shop ] getContainer error:', error);
            return null;
        }
    };

    clearChest = (shop) => {
        try {
            const container = this.getContainer(shop);
            if (!container) return;

            Array.from({ length: container.size }).forEach((_, i) => {
                container.setItem(i, undefined);
            });
        } catch (error) {
            console.error('[ Shop ] clearChest error:', error);
        }
    };

    spawnItem = (shop, itemId, amount) => {
        try {
            const dim = world.getDimension(shop.dimension);
            if (!dim) return amount;

            const { x, y, z } = shop.location;
            const location = { x: x + 0.5, y: y + 0.5, z: z + 0.5 };

            let remaining = amount;
            const BATCH_SIZE = 64;

            while (remaining > 0) {
                const batchSize = Math.min(remaining, BATCH_SIZE);
                dim.spawnItem(new ItemStack(itemId, batchSize), location);
                remaining -= batchSize;
            }

            return 0;
        } catch (error) {
            console.error('[ Shop ] spawnItem error:', error);
            return amount;
        }
    };

    spawnItemStack = (shop, itemStack) => {
        try {
            const dim = world.getDimension(shop.dimension);
            if (!dim) return;

            const { x, y, z } = shop.location;
            const location = { x: x + 0.5, y: y + 0.5, z: z + 0.5 };

            dim.spawnItem(itemStack, location);
        } catch (error) {
            console.error('[ Shop ] spawnItemStack error:', error);
        }
    };

    archiveShop = (shop) => {
        const data = shopDatabase.data;
        if (!data.deletedShops) data.deletedShops = {};

        const archiveEntry = {
            ...shop,
            deletedAt: helpers.now(),
            archived: true,
        };

        archiveEntry.prices = {};
        archiveEntry.status.pendingRevenue = 0;
        archiveEntry.salesHistory = [];
        if (archiveEntry.stats) delete archiveEntry.stats;
        if (archiveEntry.container && archiveEntry.container.containerHash !== undefined) {
            delete archiveEntry.container.containerHash;
        }

        data.deletedShops[shop.shopId] = archiveEntry;
    };

    deleteShop = (shopId) => {
        try {
            const data = shopDatabase.data;
            const shop = data.shops[shopId];
            if (!shop) return;

            this.clearChest(shop);

            this.archiveShop(shop);

            const key = helpers.blockKey(shop.location.x, shop.location.y, shop.location.z);
            delete data.protectedBlocks[key];

            delete data.shops[shopId];
            shopDatabase.save();
        } catch (error) {
            console.error('[Shop] deleteShop:', error);
        }
    };
}

export default new BlockUtils();
