import shopCreator from './shopCreator.js';
import shopQueries from './shopQueries.js';
import eventHandlers from './eventHandlers.js';
import revenue from './revenue.js';

class ShopEngine {
    createShop = shopCreator.createShop;
    findShopByBlock = shopQueries.findShopByBlock;
    findShopById = shopQueries.findShopById;
    countPlayerShops = shopQueries.countPlayerShops;
    getContainerSlotCount = shopQueries.getContainerSlotCount;
    onShopInteract = eventHandlers.onShopInteract;
    onShopBreak = eventHandlers.onShopBreak;
    onShopExplosion = eventHandlers.onShopExplosion;
    claimRevenue = revenue.claimRevenue;
}

export default new ShopEngine();
