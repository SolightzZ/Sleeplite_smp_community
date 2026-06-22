import { system, world } from '@minecraft/server';
import {
   MSG,
   IMPACT_MSGS,
   FLAME_MSGS,
   DROWN_MSGS,
   DAMAGE_CAUSE,
   BLOOD_PARTICLES,
   EFFECT_MAP,
   SEV_MSGS,
   EXP_MSGS,
   EXP_SOUNDS,
   getExpTier,
   MAX_HURT,
   HURT_MASK,
   MAX_EFF,
   EFF_MASK,
   randElem,
   buildHurtEffect,
} from './utils.js';

class XVisuals {
   errorCount = 0;
   healthComponents = new Map();
   healthStates = new Map();
   playerMap = new Map();
   playerIds = [];
   heartbeatingPlayers = new Map();
   tickCounter = 0;

   hurtPlayers = new Array(MAX_HURT);
   hurtDamages = new Array(MAX_HURT);
   hurtCauses = new Array(MAX_HURT);
   hurtHead = 0;
   hurtSize = 0;

   effectPlayers = new Array(MAX_EFF);
   effectMessages = new Array(MAX_EFF);
   effectHead = 0;
   effectSize = 0;

   constructor() {
      for (const player of world.getAllPlayers()) this.playerMap.set(player.id, player);
      this.refreshIds();
      this.registerEvents();
      this.interval = system.runInterval(() => this.tick(), 2);
   }

   registerEvents() {
      world.afterEvents.playerJoin.subscribe((event) => {
         system.run(() => {
            const player = world.getAllPlayers().find((p) => p.id === event.playerId);
            if (player?.isValid) {
               this.playerMap.set(event.playerId, player);
               this.refreshIds();
            }
         });
      });

      world.afterEvents.playerSpawn.subscribe(({ player }) => {
         if (!player) return;
         this.playerMap.set(player.id, player);
         this.healthComponents.delete(player.id); //อัปเดต cache ตอน respawn
         this.refreshIds();
      });

      world.afterEvents.playerLeave.subscribe(({ playerId }) => {
         this.cleanupPlayer(playerId);
      });

      world.afterEvents.entityHurt.subscribe((event) => {
         try {
            const entity = event.hurtEntity;
            const dmg = event.damage;
            if (dmg === 0 || !entity || entity.typeId !== 'minecraft:player') return;
            if (this.hurtSize >= MAX_HURT) return;
            const tail = (this.hurtHead + this.hurtSize) & HURT_MASK;
            this.hurtPlayers[tail] = entity;
            this.hurtDamages[tail] = dmg;
            this.hurtCauses[tail] = event.damageSource.cause;
            this.hurtSize++;
         } catch (error) {
            this.logError('[xVisuals] entityHurt', error);
         }
      });

      world.afterEvents.effectAdd.subscribe((event) => {
         try {
            const entity = event.entity;
            if (!entity || entity.typeId !== 'minecraft:player') return;
            const message = EFFECT_MAP[event.effect.typeId];
            if (!message || this.effectSize >= MAX_EFF) return;
            const tail = (this.effectHead + this.effectSize) & EFF_MASK;
            this.effectPlayers[tail] = entity;
            this.effectMessages[tail] = message;
            this.effectSize++;
         } catch (error) {
            this.logError('[xVisuals] effectAdd', error);
         }
      });

      system.afterEvents.scriptEventReceive.subscribe((event) => {
         if (event.id === 'xVisuals:addon') {
            system.sendScriptEvent('xVisualsAddon:activated', 'Activated');
            system.clearRun(this.interval);
         }
      });
   }

   tick() {
      this.tickCounter++;
      if (this.errorCount > 0) this.errorCount--;

      if (this.tickCounter % 10 === 0) {
         try {
            this.healthMonitor();
         } catch (error) {
            this.logError('[xVisuals] health_monitor', error);
         }
      }

      try {
         this.drainHeartbeats();
      } catch (error) {
         this.logError('[xVisuals] heartbeat', error);
      }

      try {
         this.drainHurtQueue();
      } catch (error) {
         this.logError('[xVisuals] hurt_drain', error);
      }

      try {
         this.drainEffectIcons();
      } catch (error) {
         this.logError('[xVisuals] effect_icon', error);
      }
   }

   logError(tag, error) {
      if (this.errorCount > 100) return;
      this.errorCount++;
      console.error(tag + ': ', error);
   }

   refreshIds = () => {
      this.playerIds = [...this.playerMap.keys()];
   };

   cleanupPlayer(playerId) {
      this.playerMap.delete(playerId);
      this.healthComponents.delete(playerId);
      this.healthStates.delete(playerId);
      this.heartbeatingPlayers.delete(playerId);
      this.refreshIds();
   }

   //เลือดต่ำ 50% ส่ง message
   getHealthState(playerId) {
      let state = this.healthStates.get(playerId);
      if (!state) {
         state = { lowHealth: false, msgSent: false };
         this.healthStates.set(playerId, state);
      }
      return state;
   }

   updateLowHealth(player, hp) {
      const isLow = hp <= 50;
      const state = this.getHealthState(player.id);
      if (state.lowHealth === isLow) return;
      state.lowHealth = isLow;
      if (isLow) {
         if (state.msgSent) return;
         state.msgSent = true;
         player.sendMessage('xVisLowHealth0Blur');
      } else {
         if (!state.msgSent) return;
         state.msgSent = false;
         player.sendMessage('xVisFalseLowHealth0Blur');
      }
   }

   healthMonitor() {
      if (this.playerIds.length === 0) return;
      for (let i = 0; i < this.playerIds.length; i++) {
         const playerId = this.playerIds[i];
         const player = this.playerMap.get(playerId);
         if (!player || !player.isValid) {
            this.cleanupPlayer(playerId);
            continue;
         }

         try {
            let health = this.healthComponents.get(playerId);
            if (!health) {
               health = player.getComponent('minecraft:health');
               if (!health) continue;
               this.healthComponents.set(playerId, health);
            }
            const hp = (health.currentValue / health.effectiveMax) * 100;
            this.updateLowHealth(player, hp);
            if (hp <= 30 && !this.heartbeatingPlayers.has(playerId)) this.heartbeatingPlayers.set(playerId, { cooldown: 0 });
            else if (hp > 30 && this.heartbeatingPlayers.has(playerId)) this.heartbeatingPlayers.delete(playerId);
         } catch (error) {
            this.logError('[xVisuals] health_monitor', error);
         }
      }
   }

   drainHeartbeats() {
      if (this.heartbeatingPlayers.size === 0) return;

      for (const [playerId, data] of this.heartbeatingPlayers) {
         data.cooldown--;

         if (data.cooldown > 0) continue;
         const player = this.playerMap.get(playerId);

         if (!player || !player.isValid) {
            this.heartbeatingPlayers.delete(playerId);
            continue;
         }
         try {
            player.playSound('mob.warden.heartbeat', { location: player.location, volume: 1, pitch: 1 });
            data.cooldown = 10;
         } catch (error) {
            this.logError('[xVisuals] heartbeat', error);
         }
      }
   }

   drainHurtQueue() {
      let sz = this.hurtSize;
      if (sz === 0) return;
      const count = sz < 4 ? sz : 4;
      const players = this.hurtPlayers,
         damages = this.hurtDamages,
         causes = this.hurtCauses;
      let head = this.hurtHead;

      for (let i = 0; i < count; i++) {
         const idx = (head + i) & HURT_MASK;
         const player = players[idx],
            damage = damages[idx],
            cause = causes[idx];
         players[idx] = null;
         damages[idx] = 0;
         causes[idx] = null;
         if (!player || !player.isValid) continue;

         const effect = buildHurtEffect(damage, cause);
         const loc = player.location;
         if (effect.bloodParticle) player.dimension.spawnParticle(effect.bloodParticle, loc);
         if (effect.sound) player.playSound(effect.sound.id, { location: loc, volume: effect.sound.volume });
         player.sendMessage(effect.message);
      }
      this.hurtHead = (head + count) & HURT_MASK;
      this.hurtSize = sz - count;
   }

   drainEffectIcons() {
      let sz = this.effectSize;
      if (sz === 0) return;
      const count = sz < 8 ? sz : 8;
      const players = this.effectPlayers,
         messages = this.effectMessages;
      let head = this.effectHead;

      for (let i = 0; i < count; i++) {
         const idx = (head + i) & EFF_MASK;
         const player = players[idx],
            message = messages[idx];
         players[idx] = null;
         messages[idx] = null;
         if (player?.isValid) {
            try {
               player.sendMessage(message);
            } catch (error) {
               this.logError('[xVisuals] effect_icon', error);
            }
         }
      }
      this.effectHead = (head + count) & EFF_MASK;
      this.effectSize = sz - count;
   }
}

export default new XVisuals();
