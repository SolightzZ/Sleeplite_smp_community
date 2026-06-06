import shopDatabase from './database.js';
import helpers from '../utils/helpers.js';

class ShopQueries {
    findShopByBlock = (block) => {
        const data = shopDatabase.data;
        const key = helpers.blockKey(block.location.x, block.location.y, block.location.z);
        const protectedEntry = data.protectedBlocks[key];
        if (!protectedEntry) return null;

        const shopId = typeof protectedEntry === 'object' ? protectedEntry.shopId : protectedEntry;
        return data.shops[shopId] || null;
    };

    findShopById = (shopId) => {
        return shopDatabase.data.shops[shopId] || null;
    };

    countPlayerShops = (playerId) => {
        return Object.values(shopDatabase.data.shops).filter(
            (shop) => shop.owner.playerId === playerId,
        ).length;
    };

    getContainerSlotCount = (blockId) => {
        if (blockId === 'minecraft:barrel') return 28;
        return 28;
    };
}

export default new ShopQueries();
