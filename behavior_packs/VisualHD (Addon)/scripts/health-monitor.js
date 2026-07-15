import { HEALTH, SPAWN_LIMITS, COOLDOWNS, ERROR_LIMITS, LOW_HEALTH_MSG, FALSE_LOW_HEALTH_MSG, HEARTBEAT_SOUND } from './config.js';
import { pcheck, getHealthPercent, clearPlayerCache } from './shared/player.js';

const HEALTH_BATCH = HEALTH.BATCH;
const MAX_HEARTBEATS_PER_TICK = SPAWN_LIMITS.HEARTBEATS_PER_TICK;
const LOW_HEALTH_THRESHOLD = HEALTH.LOW_THRESHOLD;
const CRITICAL_HEALTH_THRESHOLD = HEALTH.CRITICAL_THRESHOLD;
const HEARTBEAT_COOLDOWN = COOLDOWNS.HEARTBEAT;
const MAX_HEALTH_ERRORS = ERROR_LIMITS.MAX_HEALTH_ERRORS;

class XHealthMonitor {
   errorCount = 0;
   healthStates = new Map();
   heartbeatingPlayers = new Map();
   healthCursor = 0;
   healthSnapshot = null;

   getState(playerId) {
      let state = this.healthStates.get(playerId);
      if (!state) {
         state = { lowHealth: false, msgSent: false };
         this.healthStates.set(playerId, state);
      }
      return state;
   }

   updateLowHealth(player, hp) {
      if (!pcheck(player)) return;
      const isLow = hp <= LOW_HEALTH_THRESHOLD;
      const state = this.getState(player.id);
      if (state.lowHealth === isLow) return;
      state.lowHealth = isLow;
      if (isLow && !state.msgSent) {
         state.msgSent = true;
         player.sendMessage({ translate: LOW_HEALTH_MSG });
      } else if (!isLow && state.msgSent) {
         state.msgSent = false;
         player.sendMessage({ translate: FALSE_LOW_HEALTH_MSG });
      }
   }

   tick(playerMap) {
      const total = playerMap.size;
      if (total === 0) return;

      if (this.healthCursor === 0 || !this.healthSnapshot || this.healthSnapshot.length !== total) {
         this.healthSnapshot = [...playerMap.entries()];
      }
      const snapshot = this.healthSnapshot;

      const cursor = this.healthCursor;

      for (let i = 0; i < HEALTH_BATCH && cursor + i < total; i++) {
         const [playerId, player] = snapshot[cursor + i];
         if (!pcheck(player)) {
            playerMap.delete(playerId);
            this.healthStates.delete(playerId);
            this.heartbeatingPlayers.delete(playerId);
            clearPlayerCache(playerId);
            continue;
         }

         try {
            const hp = getHealthPercent(player);
            if (hp == null) continue;
            this.updateLowHealth(player, hp);
            if (hp <= CRITICAL_HEALTH_THRESHOLD && !this.heartbeatingPlayers.has(playerId)) {
               this.heartbeatingPlayers.set(playerId, { cooldown: 0 });
            } else if (hp > CRITICAL_HEALTH_THRESHOLD && this.heartbeatingPlayers.has(playerId)) {
               this.heartbeatingPlayers.delete(playerId);
            }
         } catch {
            this.healthSnapshot = null;
         }
      }

      this.healthCursor = cursor + HEALTH_BATCH;
      if (this.healthCursor >= total) {
         this.healthCursor = 0;
         this.healthSnapshot = null;
      }
   }

   drainHeartbeats(playerMap) {
      if (this.heartbeatingPlayers.size === 0) return;

      let processed = 0;
      for (const [playerId, data] of this.heartbeatingPlayers) {
         if (processed++ >= MAX_HEARTBEATS_PER_TICK) break;
         data.cooldown--;
         if (data.cooldown > 0) continue;

         const player = playerMap.get(playerId);
         if (!pcheck(player)) {
            this.heartbeatingPlayers.delete(playerId);
            continue;
         }
         try {
            player.playSound(HEARTBEAT_SOUND.id, { location: player.location, volume: HEARTBEAT_SOUND.volume });
            data.cooldown = HEARTBEAT_COOLDOWN;
         } catch {
            if (this.errorCount < MAX_HEALTH_ERRORS) {
               this.errorCount++;
               console.warn('[xVisuals] heartbeat drain');
            }
         }
      }
   }

   cleanup(playerId) {
      this.healthStates.delete(playerId);
      this.heartbeatingPlayers.delete(playerId);
      clearPlayerCache(playerId);
      this.healthSnapshot = null;
   }
}

export { XHealthMonitor };
