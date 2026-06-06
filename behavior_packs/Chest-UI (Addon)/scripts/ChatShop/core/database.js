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
            version: 1,
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
