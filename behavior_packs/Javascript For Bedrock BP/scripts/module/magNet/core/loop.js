import { system, world } from '@minecraft/server';
import { MagnetConfig } from '../config.js';
import { pullItemsToPlayer } from './puller.js';
import { clearMagnetRunId, countMagnetUsers, getMagnetRunId, getMagnetUserIds, hasMagnetRunId, removeMagnetUser, setMagnetRunId } from './state.js';

export const stopMagnetLoop = () => {
    if (hasMagnetRunId()) {
        system.clearRun(getMagnetRunId());
        clearMagnetRunId();
    }
};

export const startMagnetLoop = () => {
    if (hasMagnetRunId()) return;

    const id = system.runInterval(() => {
        try {
            if (countMagnetUsers() === 0) {
                stopMagnetLoop();
                return;
            }

            const allPlayers = world.getAllPlayers();
            const playerMap = new Map();

            for (let i = 0; i < allPlayers.length; i++) {
                playerMap.set(allPlayers[i].id, allPlayers[i]);
            }

            const ids = getMagnetUserIds();
            const toRemove = [];

            for (const playerId of ids) {
                const player = playerMap.get(playerId);

                if (player && player.isValid) {
                    pullItemsToPlayer(player);
                } else {
                    toRemove.push(playerId);
                }
            }

            for (let i = 0; i < toRemove.length; i++) {
                removeMagnetUser(toRemove[i]);
            }
        } catch (err) {
            console.error('[Magnet] Loop Error:', err);
            stopMagnetLoop();
        }
    }, MagnetConfig.TICK_SPEED);
    setMagnetRunId(id);
};
