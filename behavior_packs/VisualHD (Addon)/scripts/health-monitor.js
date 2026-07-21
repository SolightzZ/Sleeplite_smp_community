import { COOLDOWNS, ERROR_LIMITS, FALSE_LOW_HEALTH_MSG, HEARTBEAT_SOUND, LOW_HEALTH_MSG, SPAWN_LIMITS, TICK_INTERVAL } from './config.js';
import { clearPlayerCache, getHealthPercent, getValid } from './shared/player.js';

const HEALTH_BATCH_BASE = 15;
const MAX_HEARTBEATS_PER_TICK = SPAWN_LIMITS.HEARTBEATS_PER_TICK;
const LOW_HEALTH_THRESHOLD = 30;
const CRITICAL_HEALTH_THRESHOLD = 30;
const HEARTBEAT_COOLDOWN = COOLDOWNS.HEARTBEAT;
const MAX_HEALTH_ERRORS = ERROR_LIMITS.MAX_HEALTH_ERRORS;

class XHealthMonitor {
   errorCount = 0;
   healthStates = new Map();
   heartbeatingPlayers = new Map();
   healthCursor = 0;
   healthSnapshot = null;
   snapshotLen = 0;
   get _batchSize() {
      return this.snapshotLen > 0 ? Math.max(HEALTH_BATCH_BASE, Math.ceil(this.snapshotLen / TICK_INTERVAL)) : HEALTH_BATCH_BASE;
   }

   getState(playerId) {
      let state = this.healthStates.get(playerId);
      if (!state) {
         state = { lowHealth: false, msgSent: false };
         this.healthStates.set(playerId, state);
      }
      return state;
   }

   updateLowHealth(player, hp) {
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

      if (this.healthCursor === 0 || !this.healthSnapshot || this.snapshotLen !== total) {
         if (!this.healthSnapshot || this.healthSnapshot.length < total) {
            this.healthSnapshot = new Array(total);
         }
         let i = 0;
         for (const entry of playerMap) {
            this.healthSnapshot[i++] = entry;
         }
         this.snapshotLen = total;
      }
      const snapshot = this.healthSnapshot;
      const batch = this._batchSize;

      const cursor = this.healthCursor;
      const limit = Math.min(cursor + batch, total);

      for (let i = cursor; i < limit; i++) {
         const entry = snapshot[i];
         if (!entry) continue;
         const playerId = entry[0];
         const player = entry[1];
         if (!getValid(player)) {
            playerMap.delete(playerId);
            this.healthStates.delete(playerId);
            this.heartbeatingPlayers.delete(playerId);
            clearPlayerCache(playerId);
            snapshot[i] = null;
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
         } catch (error) {
            this.healthSnapshot = null;
            this.snapshotLen = 0;
            if (this.errorCount < MAX_HEALTH_ERRORS) {
               this.errorCount++;
               console.warn('[xVisuals] health tick:', error);
            }
         }
      }

      this.healthCursor = limit;
      if (this.healthCursor >= total) {
         this.healthCursor = 0;
         this.healthSnapshot = null;
         this.snapshotLen = 0;
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
         if (!getValid(player)) {
            this.heartbeatingPlayers.delete(playerId);
            continue;
         }
         try {
            player.playSound(HEARTBEAT_SOUND.id, { location: player.location, volume: HEARTBEAT_SOUND.volume });
            data.cooldown = HEARTBEAT_COOLDOWN;
         } catch (error) {
            if (this.errorCount < MAX_HEALTH_ERRORS) {
               this.errorCount++;
               console.warn('[xVisuals] heartbeat drain:', error);
            }
         }
      }
   }

   cleanup(playerId) {
      this.healthStates.delete(playerId);
      this.heartbeatingPlayers.delete(playerId);
      clearPlayerCache(playerId);
      this.healthSnapshot = null;
      this.snapshotLen = 0;
   }
}

export { XHealthMonitor };
