import { CONFIG } from '../config.js';
import dbIO from './dbIO.js';

class ShopDatabase {
    constructor() {
        this._cache = null;
    }

    load() {
        try {
            const raw = dbIO.loadRaw();
            if (!raw) {
                this._cache = this._createEmpty();
                return this._cache;
            }
            this._cache = JSON.parse(raw);

            if (!this._cache.version) this._cache.version = 1;

            if (this._cache.version === 1) {
                this.migrateToV2();
            }

            if (!this._cache.settings) this._cache.settings = this._defaultSettings();
            if (!this._cache.shops) this._cache.shops = {};
            if (!this._cache.protectedBlocks) this._cache.protectedBlocks = {};

            Object.values(this._cache.shops).forEach((shop) => {
                if (!shop.prices) shop.prices = {};
                if (shop.items) delete shop.items;
                if (shop.stats?.totalStock != null) delete shop.stats.totalStock;
            });

            return this._cache;
        } catch (error) {
            console.error('[ ShopDB ] Load failed:', error);
            this._cache = this._createEmpty();
            return this._cache;
        }
    }

    migrateToV2() {
        try {
            if (!this._cache) return;

            // 1. Migrate shops
            if (this._cache.shops) {
                Object.keys(this._cache.shops).forEach((shopId) => {
                    const shop = this._cache.shops[shopId];
                    if (!shop) return;

                    if (shop.container) {
                        delete shop.container.containerHash;
                    }
                    if (shop.stats) {
                        delete shop.stats;
                    }

                    // Prices: slot_X to X
                    if (shop.prices) {
                        const newPrices = {};
                        Object.entries(shop.prices).forEach(([key, val]) => {
                            const newKey = key.startsWith('slot_') ? key.replace('slot_', '') : key;
                            newPrices[newKey] = val;
                        });
                        shop.prices = newPrices;
                    }

                    // Buyers: name to playerName
                    if (shop.buyers) {
                        Object.keys(shop.buyers).forEach((buyerId) => {
                            const buyer = shop.buyers[buyerId];
                            if (buyer && buyer.name !== undefined) {
                                buyer.playerName = buyer.name;
                                delete buyer.name;
                            }
                        });
                    }

                    // Sales history: object to array
                    if (
                        shop.salesHistory &&
                        typeof shop.salesHistory === 'object' &&
                        !Array.isArray(shop.salesHistory)
                    ) {
                        shop.salesHistory = Object.values(shop.salesHistory);
                    } else if (!shop.salesHistory) {
                        shop.salesHistory = [];
                    }
                });
            }

            // 2. Migrate protectedBlocks: convert objects to strings
            if (this._cache.protectedBlocks) {
                Object.keys(this._cache.protectedBlocks).forEach((key) => {
                    const entry = this._cache.protectedBlocks[key];
                    if (entry && typeof entry === 'object' && entry.shopId) {
                        this._cache.protectedBlocks[key] = entry.shopId;
                    }
                });
            }

            // 3. Migrate deletedShops
            if (this._cache.deletedShops) {
                Object.keys(this._cache.deletedShops).forEach((shopId) => {
                    const shop = this._cache.deletedShops[shopId];
                    if (!shop) return;

                    if (shop.container) {
                        delete shop.container.containerHash;
                    }
                    if (shop.stats) {
                        delete shop.stats;
                    }

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

                    if (
                        shop.salesHistory &&
                        typeof shop.salesHistory === 'object' &&
                        !Array.isArray(shop.salesHistory)
                    ) {
                        shop.salesHistory = Object.values(shop.salesHistory);
                    } else if (!shop.salesHistory) {
                        shop.salesHistory = [];
                    }
                });
            }

            this._cache.version = 2;
            this.save();
            console.log('[ ShopDB ] Successfully migrated database to version 2.');
        } catch (error) {
            console.error('[ ShopDB ] Migration to version 2 failed:', error);
        }
    }

    save() {
        try {
            if (!this._cache) return;
            const json = JSON.stringify(this._cache);
            dbIO.saveRaw(json);
        } catch (error) {
            console.error('[ ShopDB ] Save failed:', error);
        }
    }

    get data() {
        if (!this._cache) this.load();
        return this._cache;
    }

    _createEmpty() {
        return {
            version: 2,
            settings: this._defaultSettings(),
            shops: {},
            protectedBlocks: {},
        };
    }

    _defaultSettings() {
        return {
            dimension: CONFIG.dim,
            maxDistance: CONFIG.maxDistance,
            currencyItem: CONFIG.currencyId,
            allowedContainers: [...CONFIG.allowedContainers],
        };
    }
}

export default new ShopDatabase();
