import { MagnetConfig } from '../config.js';
import { pullItemsToPlayer } from './puller.js';
import { countMagnetUsers, getMagnetUserIds, removeMagnetUser } from './state.js';
import { Registry } from '../../../router/core/registry.js';

export const stopMagnetLoop = () => {};

export const startMagnetLoop = () => {};

export const magnetTick = () => {
    try {
        if (countMagnetUsers() === 0) return;

        const ids = getMagnetUserIds();
        const toRemove = [];

        for (const playerId of ids) {
            // ค้นหาผู้เล่นจาก Registry ด้วย ID แบบ O(1) เพื่อหลีกเลี่ยงภาระประมวลผลและการจัดสรร Map
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
