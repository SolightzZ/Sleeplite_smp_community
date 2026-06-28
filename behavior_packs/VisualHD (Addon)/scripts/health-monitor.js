const HEALTH_BATCH = 15;
const MAX_HEARTBEATS_PER_TICK = 5;
const LOW_HEALTH_THRESHOLD = 50;
const CRITICAL_HEALTH_THRESHOLD = 30;
const HEARTBEAT_COOLDOWN = 10;
const MAX_HEALTH_ERRORS = 10;

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
      if (!player?.isValid) return;
      const isLow = hp <= LOW_HEALTH_THRESHOLD;
      const state = this.getState(player.id);
      if (state.lowHealth === isLow) return;
      state.lowHealth = isLow;
      if (isLow && !state.msgSent) {
         state.msgSent = true;
         player.sendMessage({ translate: 'xVisLowHealth0Blur' });
      } else if (!isLow && state.msgSent) {
         state.msgSent = false;
         player.sendMessage({ translate: 'xVisFalseLowHealth0Blur' });
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
         if (!player || !player.isValid) {
            playerMap.delete(playerId);
            this.healthStates.delete(playerId);
            this.heartbeatingPlayers.delete(playerId);
            continue;
         }

         try {
            const health = player.getComponent('minecraft:health');
            if (!health) continue;
            const hp = (health.currentValue / health.effectiveMax) * 100;
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
         if (!player || !player.isValid) {
            this.heartbeatingPlayers.delete(playerId);
            continue;
         }
         try {
            player.playSound('mob.warden.heartbeat', { location: player.location, volume: 0.8 });
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
      this.healthSnapshot = null;
   }
}

export { XHealthMonitor };
