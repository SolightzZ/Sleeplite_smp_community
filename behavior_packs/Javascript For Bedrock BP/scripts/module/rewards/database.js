import { config } from './constants.js';

function load(player) {
    try {
        const rawData = player.getDynamicProperty(config.dbKey);
        if (!rawData) return { last: null, count: 0 };
        return JSON.parse(rawData);
    } catch (error) {
        console.error('[ Rewards ] load Error: ' + error);
        return { last: null, count: 0 };
    }
}

function save(player, data) {
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
    console.warn('Reward reset' + config.dbKey);
    player.setDynamicProperty(config.dbKey, undefined);
}

export { load, save, reset };
