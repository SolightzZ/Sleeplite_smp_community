import { system, HudVisibility } from '@minecraft/server';
import { Registry } from '../../../router/core/registry.js';

import { CONFIG } from '../config.js';
import { getCameraFrame } from './afk.js';
import { tickBlockCache } from './block.js';
import { hasMoved, refreshBaseline } from './stateManager.js';
import { playerStates } from './state.js';

function getPlayerById(playerId) {
    try {
        // ค้นหาผู้เล่นด้วย ID แบบ O(1) จากระบบลงทะเบียน เพื่อหลีกเลี่ยงการสแกนหาแบบ O(N)
        return Registry.get(playerId)?.player;
    } catch {
        return undefined;
    }
}

function setCinematicCamera(player, position, rotation) {
    player.camera.setCamera('minecraft:free', {
        location: position,
        rotation: { x: rotation.pitch, y: rotation.yaw },
    });
}

class CinematicScheduler {
    constructor() {
        this._ids = [];
        this._cursor = 0;
        this.intervalId = undefined;
    }

    get size() {
        return this._ids.length;
    }

    enqueue(playerId) {
        if (!this._ids.includes(playerId)) {
            this._ids.push(playerId);
        }
        if (this.intervalId === undefined) {
            this.intervalId = system.runInterval(() => this.tick(), 1);
        }
    }

    dequeue(playerId) {
        const idx = this._ids.indexOf(playerId);
        if (idx === -1) return;
        this._ids.splice(idx, 1);
        if (this._cursor > idx) this._cursor--;
        if (this._cursor >= this._ids.length) this._cursor = 0;
        if (this._ids.length === 0) this.stop();
    }

    tick() {
        if (this._ids.length === 0) {
            this.stop();
            return;
        }

        tickBlockCache();

        const budget = Math.min(CONFIG.schedulerBudget, this._ids.length);
        const toRemove = [];

        for (let i = 0; i < budget; i++) {
            if (this._ids.length === 0) break;
            if (this._cursor >= this._ids.length) this._cursor = 0;

            const playerId = this._ids[this._cursor++];
            const player = getPlayerById(playerId);

            if (!player?.isValid) {
                toRemove.push(playerId);
                continue;
            }

            const state = playerStates.get(playerId);
            if (!state?.isAfk) {
                toRemove.push(playerId);
                continue;
            }

            if (hasMoved(player, state)) {
                state.isAfk = false;

                player.camera.clear();
                player.onScreenDisplay.setHudVisibility(HudVisibility.Reset);
                refreshBaseline(player, state);
                toRemove.push(playerId);
                continue;
            }

            try {
                const { position: pos, rotation: rot } = getCameraFrame(player, state);
                setCinematicCamera(player, pos, rot);
            } catch (error) {
                console.error(' [ AFKCinematic ] CinematicScheduler: ' + error);
                toRemove.push(playerId);
                continue;
            }

            state.shotTicks++;
            const shot = state.sequence[state.sequenceIndex];
            if (state.shotTicks >= shot.duration) {
                let nextIndex;
                do {
                    nextIndex = Math.floor(Math.random() * state.sequence.length);
                } while (state.sequence.length > 1 && nextIndex === state.sequenceIndex);
                state.sequenceIndex = nextIndex;
                state.shotTicks = 0;
                state.waveClock = Math.random() * Math.PI * 2;
            }
        }

        for (const playerId of toRemove) {
            this.dequeue(playerId);
        }
    }

    stop() {
        if (this.intervalId !== undefined) {
            system.clearRun(this.intervalId);
            this.intervalId = undefined;
        }
        this._ids.length = 0;
        this._cursor = 0;
    }
}

export const cinematicScheduler = new CinematicScheduler();
