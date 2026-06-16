import { config } from './constants.js';

const cache = new Map();

function load(player) {
    const cached = cache.get(player.id);
    if (cached !== undefined) return cached;
    try {
        const rawData = player.getDynamicProperty(config.dbKey);
        const data = !rawData ? { last: null, count: 0 } : JSON.parse(rawData);
        cache.set(player.id, data);
        return data;
    } catch (error) {
        console.error('[ Rewards ] load Error: ' + error);
        return { last: null, count: 0 };
    }
}

function save(player, data) {
    cache.set(player.id, data);
    try {
        const jsonString = JSON.stringify(data);
        player.setDynamicProperty(config.dbKey, jsonString);
        return true;
    } catch (error) {
        console.error('[ Rewards ] Save Error: ' + error);
        return false;
    }
}

function reset(player) {
    cache.delete(player.id);
    console.warn('Reward reset' + config.dbKey);
    player.setDynamicProperty(config.dbKey, undefined);
}

export function clearRewardCache(playerId) {
    cache.delete(playerId);
}

export { load, save, reset };
