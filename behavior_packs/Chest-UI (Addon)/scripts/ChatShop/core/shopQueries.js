import shopDatabase from './database.js';
import helpers from '../utils/helpers.js';

class ShopQueries {
    findShopByBlock = (block) => {
        const data = shopDatabase.data;
        const key = helpers.blockKey(block.location.x, block.location.y, block.location.z);
        const protectedEntry = data.protectedBlocks[key];
        if (!protectedEntry) return null;

        return data.shops[protectedEntry.shopId] || null;
    };

    findShopById = (shopId) => {
        return shopDatabase.data.shops[shopId] || null;
    };

    countPlayerShops = (playerId) => {
        return Object.values(shopDatabase.data.shops).filter((shop) => shop.owner.playerId === playerId).length;
    };

    getContainerSlotCount = (blockId) => {
        if (blockId === 'minecraft:barrel') return 27;
        return 27;
    };
}

export default new ShopQueries();
