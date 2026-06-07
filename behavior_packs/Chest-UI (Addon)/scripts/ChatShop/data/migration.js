function migrateShop(shop) {
    if (!shop) return;

    if (shop.items) delete shop.items;

    if (shop.container) delete shop.container.containerHash;

    if (shop.stats) delete shop.stats;

    if (shop.prices) {
        const newPrices = {};

        Object.entries(shop.prices).forEach(([key, val]) => {
            const newKey = key.startsWith('slot_') ? key.replace('slot_', '') : key;
            newPrices[newKey] = val;
        });

        shop.prices = newPrices;
    }

    if (shop.buyers) {
        Object.keys(shop.buyers).forEach((buyerId) => {
            const buyer = shop.buyers[buyerId];

            if (buyer && buyer.name !== undefined) {
                buyer.playerName = buyer.name;

                delete buyer.name;
            }
        });
    }

    if (shop.salesHistory && typeof shop.salesHistory === 'object' && !Array.isArray(shop.salesHistory)) {
        shop.salesHistory = Object.values(shop.salesHistory);
    } else if (!shop.salesHistory) {
        shop.salesHistory = [];
    }
}

export function migrateToV2(cache) {
    if (!cache) {
        console.error('[ ShopDB ] migrateToV2: cache is null');
        return;
    }

    if (cache.shops) {
        Object.keys(cache.shops).forEach((shopId) => {
            migrateShop(cache.shops[shopId]);
        });
    }

    if (cache.protectedBlocks) {
        Object.keys(cache.protectedBlocks).forEach((key) => {
            const entry = cache.protectedBlocks[key];

            if (entry && typeof entry === 'object' && entry.shopId) {
                cache.protectedBlocks[key] = entry.shopId;
            }
        });
    }

    if (cache.deletedShops) {
        Object.keys(cache.deletedShops).forEach((shopId) => {
            migrateShop(cache.deletedShops[shopId]);
        });
    }

    cache.version = 2;
}
