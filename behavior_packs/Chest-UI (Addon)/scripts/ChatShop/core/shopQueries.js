import shopDatabase from '../data/database.js';
import { coordinateKey } from '../utils/helpers.js';

export function findShopByBlock(block) {
    const data = shopDatabase.data;
    const blockKey = coordinateKey(block.location.x, block.location.y, block.location.z);
    const protectionEntry = data.protectedBlocks[blockKey];
    if (!protectionEntry) return null;

    const shopId = typeof protectionEntry === 'object' ? protectionEntry.shopId : protectionEntry;
    return data.shops[shopId] || null;
}

export function findShopById(shopId) {
    return shopDatabase.data.shops[shopId] || null;
}

export function countPlayerShops(playerId) {
    return Object.values(shopDatabase.data.shops).filter((shop) => shop.owner.playerId === playerId).length;
}
