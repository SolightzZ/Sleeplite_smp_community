import { CONFIG } from '../config.js';
import { migrateToV2 } from './migration.js';
import { loadRaw, saveRaw } from './storage.js';

function normalizeShop(shop) {
    if (!shop) return;

    if (!shop.shopId) shop.shopId = 'unknown';
    if (!shop.owner) shop.owner = { playerId: '', playerName: 'Unknown' };
    if (!shop.owner.playerId) shop.owner.playerId = '';
    if (!shop.owner.playerName) shop.owner.playerName = 'Unknown';
    if (!shop.createdAt) shop.createdAt = 0;
    if (!shop.updatedAt) shop.updatedAt = 0;
    if (!shop.lastSale) shop.lastSale = 0;
    if (!shop.dimension) shop.dimension = CONFIG.dimension;
    if (!shop.location) shop.location = { x: 0, y: 0, z: 0 };
    if (!shop.container) shop.container = {};
    if (!shop.baseBlock) shop.baseBlock = { x: 0, y: 0, z: 0 };
    if (!shop.protection) shop.protection = { ...CONFIG.protection };
    if (shop.protection.allowPiston != null) delete shop.protection.allowPiston;
    if (shop.protection.allowHopper != null) delete shop.protection.allowHopper;
    if (!shop.status) shop.status = {};
    if (shop.status.isEnabled == null) shop.status.isEnabled = true;
    if (shop.status.isLocked == null) shop.status.isLocked = false;
    if (shop.status.pendingRevenue == null) shop.status.pendingRevenue = 0;
    if (shop.status.visitCount == null) shop.status.visitCount = 0;
    if (!shop.status.lastAccess) shop.status.lastAccess = 0;
    if (!shop.buyers) shop.buyers = {};
    if (!shop.prices) shop.prices = {};
    if (!shop.salesHistory) shop.salesHistory = [];
}

class ShopDatabase {
    constructor() {
        this._cache = null;
    }

    load() {
        try {
            const raw = loadRaw();

            if (!raw) {
                this._cache = this._createEmptyDatabase();
                return this._cache;
            }

            this._cache = JSON.parse(raw);

            if (!this._cache.version) this._cache.version = 1;

            if (this._cache.version === 1) {
                migrateToV2(this._cache);
                this.save();
            }

            if (!this._cache.settings) this._cache.settings = this._defaultSettings();

            if (!this._cache.shops) this._cache.shops = {};

            if (!this._cache.protectedBlocks) this._cache.protectedBlocks = {};

            //Normalize - ปรับโครงสร้างร้านให้ตรงกับโค้ดปัจจุบัน
            Object.values(this._cache.shops).forEach(normalizeShop);

            if (this._cache.deletedShops) {
                Object.values(this._cache.deletedShops).forEach(normalizeShop);
            }

            return this._cache;
        } catch (error) {
            console.error('[ ShopDB ] Load failed, creating fresh:', error);
            this._cache = this._createEmptyDatabase();
            return this._cache;
        }
    }

    save() {
        try {
            if (!this._cache) return;

            const json = JSON.stringify(this._cache);

            saveRaw(json);
        } catch (error) {
            console.error('[ ShopDB ] Save failed:', error);
        }
    }

    get data() {
        if (!this._cache) {
            this.load();
        }

        return this._cache;
    }

    _createEmptyDatabase() {
        return {
            version: 2,
            settings: this._defaultSettings(),
            shops: {},
            protectedBlocks: {},
        };
    }

    _defaultSettings() {
        return {
            dimension: CONFIG.dimension,
            maxDistance: CONFIG.maxDistance,
            currencyItem: CONFIG.currencyId,
            allowedContainers: CONFIG.allowedContainers,
        };
    }
}

export default new ShopDatabase();
