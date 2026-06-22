import { MagnetConfig } from '../config.js';
import { pullItemsToPlayer } from './puller.js';
import { countMagnetUsers, getMagnetUserIds, removeMagnetUser } from './state.js';
import { Registry } from '../../../router/core/registry.js';

export const magnetTick = () => {
    try {
        if (countMagnetUsers() === 0) return;

        const ids = getMagnetUserIds();
        const toRemove = [];

        for (const playerId of ids) {
            const player = Registry.get(playerId)?.player;

            if (player && player.isValid) {
                pullItemsToPlayer(player);
            } else {
                toRemove.push(playerId);
            }
        }

        for (const playerId of toRemove) {
            removeMagnetUser(playerId);
        }
    } catch (error) {
        console.error('[Magnet] Loop Error:', error);
    }
};
