import { world } from '@minecraft/server';

import { CONFIG } from '../config.js';
import { cloneVec3 } from '../utils/math.js';
import { ensureState, refreshBaseline, hasMoved } from './stateManager.js';
import { startAfk, stopAfk } from './afk.js';
import { CinematicScheduler } from './scheduler.js';
import { playerStates } from './state.js';

export function handleIdlePoller() {
    try {
        const players = world.getAllPlayers();

        for (const player of players) {
            if (!player.isValid) continue;

            const state = ensureState(player);

            if (state.isAfk) {
                if (hasMoved(player, state)) {
                    stopAfk(player, state, cinematicScheduler);
                    refreshBaseline(player, state);
                    state.anchor = cloneVec3(player.location);
                }
                continue;
            }

            if (hasMoved(player, state)) {
                refreshBaseline(player, state);
                state.idleTicks = 0;
                state.warningShown = false;
                state.anchor = cloneVec3(player.location);
                continue;
            }

            state.idleTicks++;

            const idleTicksTarget = state.idleSecondsCache * 20;
            const warningTicksTarget = state.warningSecondsCache * 20;
            const remaining = idleTicksTarget - state.idleTicks;
            const remainingSeconds = Math.ceil(remaining / 20);

            if (!state.warningShown && remaining <= warningTicksTarget) {
                state.warningShown = true;
            }
            if (state.warningShown && remaining > 0) {
                player.onScreenDisplay.setActionBar(`§eAFK Cinematic in §c${remainingSeconds}s`);
            }

            if (remaining <= 0) {
                startAfk(player, state, cinematicScheduler);
            }
        }
    } catch (error) {
        console.error('[ AFKCinematic ] handleIdlePoller: ' + error);
    }
}

export function playerLeaveAfk(playerId) {
    try {
        if (!playerId) return;
        cinematicScheduler.dequeue(playerId);
        playerStates.delete(playerId);
    } catch (error) {
        console.error('[ AFKCinematic ] playerLeaveAfk: ' + error);
    }
}

export function setPlayerIdleTime(player, seconds) {
    try {
        const state = ensureState(player);
        const clamped = Math.max(CONFIG.minIdleSeconds, Math.min(CONFIG.maxIdleSeconds, Math.floor(seconds)));
        state.idleSeconds = clamped;
        state.idleTicks = 0;
        state.idleSecondsCache = clamped;
        state.warningSecondsCache = Math.min(CONFIG.warningSeconds, Math.max(1, clamped - 1));
        state.warningShown = false;
        refreshBaseline(player, state);
        player.sendMessage(`§7[AFK] Start time set to §e${clamped}§7 seconds.`);
    } catch (error) {
        console.error('[ AFKCinematic ] setPlayerIdleTime: ' + error);
    }
}

export function startCinematicNow(player) {
    try {
        if (!player.isValid) return;
        const state = ensureState(player);
        if (state.isAfk) {
            player.sendMessage('§7[AFK] Cinematic is already running.');
            return;
        }
        refreshBaseline(player, state);
        startAfk(player, state, cinematicScheduler);
    } catch (error) {
        console.error(' [ AFKCinematic ] startCinematicNow: ' + error);
    }
}
