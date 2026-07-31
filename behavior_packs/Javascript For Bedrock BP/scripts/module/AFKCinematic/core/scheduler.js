import { HudVisibility } from '@minecraft/server';
import { Registry } from '../../../events/registry.js';
import { CONFIG } from '../config.js';
import { getCameraFrame } from './afk.js';
import { tickBlockCache } from './block.js';
import { playerStates } from './state.js';
import { hasMoved, refreshBaseline } from './stateManager.js';
import { logError } from '../../../events/logger.js';
import { pcheck } from './../../../shared/player.js';

function getPlayerById(playerId) {
   try {
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
   }

   enqueue(playerId) {
      if (!this._ids.includes(playerId)) {
         this._ids.push(playerId);
      }
   }

   dequeue(playerId) {
      const idx = this._ids.indexOf(playerId);
      if (idx === -1) return;
      this._ids.splice(idx, 1);
      if (this._cursor > idx) this._cursor--;
      if (this._cursor >= this._ids.length) this._cursor = 0;
   }

   tick() {
      if (this._ids.length === 0) return;

      tickBlockCache();

      const budget = Math.min(CONFIG.schedulerBudget, this._ids.length);
      const toRemove = [];

      for (let i = 0; i < budget; i++) {
         if (this._ids.length === 0) break;
         if (this._cursor >= this._ids.length) this._cursor = 0;

         const playerId = this._ids[this._cursor++];
         const player = getPlayerById(playerId);

         if (!pcheck(player)) {
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
            logError('AFKCinematic', 'CinematicScheduler', error);
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

}

export const cinematicScheduler = new CinematicScheduler();
