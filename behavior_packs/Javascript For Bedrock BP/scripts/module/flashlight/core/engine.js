import { world } from '@minecraft/server';
import { TICK_RECONCILE, TICK_TARGET_LATENCY, BATCH_MIN_SIZE, BATCH_MAX_SIZE } from '../config.js';
import { processQueue, queueCursor } from './queue.js';
import { playerLights, activeHolders } from './state.js';
import { placeLightForPlayer, removeLightBlock, isFlashlightHeld } from './light-manager.js';

function syncPlayerQueue() {
    const allPlayers = world.getAllPlayers();
    const liveIds = new Set();

    for (const player of allPlayers) {
        liveIds.add(player.id);
    }

    const trackedIds = Array.from(playerLights.keys());
    for (const id of trackedIds) {
        if (!liveIds.has(id)) {
            removeLightBlock(id);
        }
    }

    activeHolders.clear();
    processQueue.length = 0;
    for (const player of allPlayers) {
        if (player && player.isValid && isFlashlightHeld(player)) {
            activeHolders.add(player.id);
            processQueue.push(player);
        }
    }

    if (queueCursor.idx >= processQueue.length) {
        queueCursor.idx = 0;
    }
}

export function FlashlightRunInterval() {
    queueCursor.tick++;

    if (queueCursor.tick % TICK_RECONCILE === 0) {
        syncPlayerQueue();
        return;
    }

    if (processQueue.length === 0) return;
    const activeCount = processQueue.length;

    const batchSize = Math.min(BATCH_MAX_SIZE, Math.max(BATCH_MIN_SIZE, Math.ceil(activeCount / TICK_TARGET_LATENCY)));

    for (let index = 0; index < batchSize; index++) {
        if (processQueue.length === 0) break;
        if (queueCursor.idx >= processQueue.length) {
            queueCursor.idx = 0;
        }

        const player = processQueue[queueCursor.idx];
        if (!player || !player.isValid) {
            if (player?.id) activeHolders.delete(player.id);
            const last = processQueue.pop();
            if (queueCursor.idx < processQueue.length) {
                processQueue[queueCursor.idx] = last;
            } else {
                queueCursor.idx = 0;
            }
            continue;
        }

        const held = isFlashlightHeld(player);
        if (!held) {
            if (playerLights.has(player.id)) {
                removeLightBlock(player.id, player.dimension);
            }
            activeHolders.delete(player.id);
            const last = processQueue.pop();
            if (queueCursor.idx < processQueue.length) {
                processQueue[queueCursor.idx] = last;
            } else {
                queueCursor.idx = 0;
            }
        } else {
            placeLightForPlayer(player, true);
            queueCursor.idx++;
        }
    }
}

export function flashSpawn(event) {
    const player = event.player;
    if (!player || !player.isValid) return;
    const playerId = player.id;

    if (isFlashlightHeld(player)) {
        activeHolders.add(playerId);
        for (const queued of processQueue) {
            if (queued.id === playerId) return;
        }
        processQueue.push(player);
    }
}

export function flashLeave(playerId) {
    removeLightBlock(playerId);
    activeHolders.delete(playerId);

    const qLen = processQueue.length;
    for (let index = 0; index < qLen; index++) {
        if (processQueue[index]?.id === playerId) {
            const last = processQueue.pop();
            if (index < processQueue.length) {
                processQueue[index] = last;
            }
            if (queueCursor.idx > index) {
                queueCursor.idx--;
            }
            break;
        }
    }

    if (queueCursor.idx >= processQueue.length) {
        queueCursor.idx = 0;
    }
}
