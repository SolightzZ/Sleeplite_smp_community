import { system, world } from '@minecraft/server';
import { EFFECT_MAP } from './utils.js';
import { XHealthMonitor } from './health-monitor.js';
import { XHurtQueue } from './hurt-queue.js';
import { XEffectQueue } from './effect-queue.js';

const TICK_INTERVAL = 3;
const MAX_ERROR_RATE = 50;
const WARMUP_TICKS = 100;

class XVisuals {
   errorCount = 0;
   playerMap = new Map();
   health = new XHealthMonitor();
   hurtQueue = new XHurtQueue();
   effectQueue = new XEffectQueue();
   inited = false;
   initTick = 0;

   constructor() {
      this.registerEvents();
      world.afterEvents.worldLoad.subscribe(() => {
         if (this.inited) return;
         this.inited = true;
         this.initTick = system.currentTick;
         for (const player of world.getAllPlayers()) {
            if (player?.isValid) this.playerMap.set(player.id, player);
         }
         this.interval = system.runInterval(() => this.tick(), TICK_INTERVAL);
      });
   }

   registerEvents() {
      world.afterEvents.playerSpawn.subscribe(({ player }) => {
         if (!player) return;
         this.playerMap.set(player.id, player);
         this.health.healthSnapshot = null;
      });

      world.afterEvents.playerLeave.subscribe(({ playerId }) => {
         this.playerMap.delete(playerId);
         this.health.cleanup(playerId);
         this.hurtQueue.removeCooldown(playerId);
         this.effectQueue.removeCooldown(playerId);
      });

      world.afterEvents.entityHurt.subscribe((event) => {
         try {
            const entity = event.hurtEntity;
            const dmg = event.damage;
            if (dmg === 0 || !entity || entity.typeId !== 'minecraft:player') return;
            this.hurtQueue.push(entity, dmg, event.damageSource.cause);
         } catch (error) {
            this.logError('[xVisuals] entityHurt', error);
         }
      });

      world.afterEvents.effectAdd.subscribe((event) => {
         try {
            if (system.currentTick - this.initTick < WARMUP_TICKS) return;
            const entity = event.entity;
            if (!entity || entity.typeId !== 'minecraft:player') return;
            const message = EFFECT_MAP[event.effect.typeId];
            if (!message) return;
            this.effectQueue.push(entity, message);
         } catch (error) {
            this.logError('[xVisuals] effectAdd', error);
         }
      });
   }

   tick() {
      if (this.errorCount > 2) this.errorCount -= 2;
      else if (this.errorCount > 0) this.errorCount--;

      try {
         this.health.tick(this.playerMap);
      } catch (error) {
         this.logError('[xVisuals] health_monitor', error);
      }

      try {
         this.health.drainHeartbeats(this.playerMap);
      } catch (error) {
         this.logError('[xVisuals] heartbeat', error);
      }

      try {
         this.hurtQueue.drain();
      } catch (error) {
         this.logError('[xVisuals] hurt_drain', error);
      }

      try {
         this.effectQueue.drain();
      } catch (error) {
         this.logError('[xVisuals] effect_icon', error);
      }
   }

   logError(tag, error) {
      if (this.errorCount > MAX_ERROR_RATE) return;
      this.errorCount++;
      console.error(tag + ': ', error);
   }
}

export default new XVisuals();
