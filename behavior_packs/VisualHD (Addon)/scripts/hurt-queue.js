import { system } from '@minecraft/server';
import { COOLDOWNS, ERROR_LIMITS, QUEUE, SPAWN_LIMITS } from './config.js';
import { getValid } from './shared/player.js';
import { buildHurtEffect, deleteCooldown, isCooldownActive, markCooldown } from './utils.js';

const { MAX_HURT, HURT_MASK } = QUEUE;
const MAX_HURT_PER_TICK = SPAWN_LIMITS.HURT_PER_TICK;
const HURT_COOLDOWN_TICKS = COOLDOWNS.HURT;
const MAX_QUEUE_ERRORS = ERROR_LIMITS.MAX_QUEUE_ERRORS;

class XHurtQueue {
   errorCount = 0;
   players = new Array(MAX_HURT);
   playerIds = new Array(MAX_HURT);
   locs = new Array(MAX_HURT);
   damages = new Array(MAX_HURT);
   causes = new Array(MAX_HURT);
   head = 0;
   size = 0;
   cooldowns = new Map();

   push(entity, damage, cause) {
      if (this.size >= MAX_HURT) return;
      const tail = (this.head + this.size) & HURT_MASK;
      this.players[tail] = entity;
      this.playerIds[tail] = entity.id;
      this.locs[tail] = entity.location;
      this.damages[tail] = damage;
      this.causes[tail] = cause;
      this.size++;
   }

   removeCooldown(playerId) {
      deleteCooldown(this.cooldowns, playerId);
   }

   drain() {
      let sz = this.size;
      if (sz === 0) return;
      const count = Math.min(sz, MAX_HURT_PER_TICK);
      const { players, playerIds, locs, damages, causes } = this;
      let head = this.head;

      for (let i = 0; i < count; i++) {
         const idx = (head + i) & HURT_MASK;
         const player = players[idx];
         const pid = playerIds[idx];
         const loc = locs[idx];
         const damage = damages[idx];
         const cause = causes[idx];
         players[idx] = null;
         playerIds[idx] = null;
         locs[idx] = null;
         damages[idx] = 0;
         causes[idx] = null;
         if (!getValid(player)) continue;

         const tick = system.currentTick;
         if (isCooldownActive(this.cooldowns, pid, tick, HURT_COOLDOWN_TICKS)) continue;

         try {
            const effect = buildHurtEffect(damage, cause);
            if (effect.bloodParticle) player.dimension.spawnParticle(effect.bloodParticle, loc);
            if (effect.sound) player.playSound(effect.sound.id, { location: loc, volume: effect.sound.volume });
            player.sendMessage(effect.message);
            markCooldown(this.cooldowns, pid, tick);
         } catch (error) {
            if (this.errorCount < MAX_QUEUE_ERRORS) {
               this.errorCount++;
               console.warn('[xVisuals] hurt_drain:', error);
            }
         }
      }

      this.head = (head + count) & HURT_MASK;
      this.size = sz - count;
   }
}

export { XHurtQueue };
