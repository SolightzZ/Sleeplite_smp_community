import { system, world, HudVisibility } from '@minecraft/server';
import { CONFIG } from '../config.js';
import { playerStates } from './state.js';
import { getCameraFrame } from './afk.js';
import { tickBlockCache } from './block.js';
import { hasMoved } from './stateManager.js';

function getPlayerById(playerId) {
    try {
        const entity = world.getEntity(playerId);
        return entity?.typeId === 'minecraft:player' ? entity : undefined;
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

export class CinematicScheduler {
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

        for (let b = 0; b < budget; b++) {
            if (this._ids.length === 0) break;
            if (this._cursor >= this._ids.length) this._cursor = 0;

            const playerId = this._ids[this._cursor++];
            const player = getPlayerById(playerId);

            if (!player?.isValid) {
                toRemove.push(playerId);
                continue;
            }

            const s = playerStates.get(playerId);
            if (!s?.isAfk) {
                toRemove.push(playerId);
                continue;
            }

            if (hasMoved(player, s)) {
                s.isAfk = false;

                player.camera.clear();
                player.onScreenDisplay.setHudVisibility(HudVisibility.Reset);
                toRemove.push(playerId);
                continue;
            }

            try {
                const { position: p, rotation: r } = getCameraFrame(player, s);
                setCinematicCamera(player, p, r);
            } catch (error) {
                console.error(' [ AFKCinematic ] CinematicScheduler: ' + error);
                toRemove.push(playerId);
                continue;
            }

            s.shotTicks++;
            const shot = s.sequence[s.sequenceIndex];
            if (s.shotTicks >= shot.duration) {
                let next;
                do {
                    next = Math.floor(Math.random() * s.sequence.length);
                } while (s.sequence.length > 1 && next === s.sequenceIndex);
                s.sequenceIndex = next;
                s.shotTicks = 0;
                s.waveClock = Math.random() * Math.PI * 2;
            }
        }

        for (let i = 0; i < toRemove.length; i++) {
            this.dequeue(toRemove[i]);
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
