import { logError } from '../../../events/logger.js';
import { Registry } from '../../../events/registry.js';
import { cache } from '../../../shared/cache.js';
import { cloneVec3 } from '../utils/math.js';
import { pcheck } from './../../../shared/player.js';
import { startAfk, stopAfk } from './afk.js';
import { cinematicScheduler } from './scheduler.js';
import { playerStates } from './state.js';
import { ensureState, hasMoved, refreshBaseline } from './stateManager.js';

export function handleIdlePoller() {
   try {
      const players = Registry.getPlayers();

      for (const player of players) {
         if (!pcheck(player)) continue;

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
            cache.setActionBar(player.onScreenDisplay, `§eAFK Cinematic in §c${remainingSeconds}s`);
         }

         if (remaining <= 0) {
            startAfk(player, state, cinematicScheduler);
         }
      }
   } catch (error) {
      logError('AFKCinematic', 'handleIdlePoller', error);
   }
}

export function playerLeaveAfk(playerId) {
   try {
      if (!playerId) return;
      cinematicScheduler.dequeue(playerId);
      playerStates.delete(playerId);
   } catch (error) {
      logError('AFKCinematic', 'playerLeaveAfk', error);
   }
}

export function startCinematicNow(player) {
   try {
      if (!pcheck(player)) return;
      const state = ensureState(player);
      if (state.isAfk) {
         cache.sendMessage(player, '§7[AFK] Cinematic is already running.');
         return;
      }
      refreshBaseline(player, state);
      startAfk(player, state, cinematicScheduler);
   } catch (error) {
      logError('AFKCinematic', 'startCinematicNow', error);
   }
}
