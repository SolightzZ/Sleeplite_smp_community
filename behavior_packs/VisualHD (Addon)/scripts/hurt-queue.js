import { system } from '@minecraft/server';
import { QUEUE, SPAWN_LIMITS, COOLDOWNS, ERROR_LIMITS } from './config.js';
import { buildHurtEffect, deleteCooldown, isCooldownActive, markCooldown } from './utils.js';
import { pcheck } from './shared/player.js';

const { MAX_HURT, HURT_MASK } = QUEUE;
const MAX_HURT_PER_TICK = SPAWN_LIMITS.HURT_PER_TICK;
const HURT_COOLDOWN_TICKS = COOLDOWNS.HURT;
const MAX_QUEUE_ERRORS = ERROR_LIMITS.MAX_QUEUE_ERRORS;

class XHurtQueue {
   errorCount = 0;
   players = new Array(MAX_HURT);
   damages = new Array(MAX_HURT);
   causes = new Array(MAX_HURT);
   head = 0;
   size = 0;
   cooldowns = new Map();

   push(entity, damage, cause) {
      if (this.size >= MAX_HURT) return;
      const tail = (this.head + this.size) & HURT_MASK;
      this.players[tail] = entity;
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
      const { players, damages, causes } = this;
      let head = this.head;

      for (let i = 0; i < count; i++) {
         const idx = (head + i) & HURT_MASK;
         const player = players[idx];
         const damage = damages[idx];
         const cause = causes[idx];
         players[idx] = null;
         damages[idx] = 0;
         causes[idx] = null;
         if (!pcheck(player)) continue;

         const tick = system.currentTick;
         if (isCooldownActive(this.cooldowns, player.id, tick, HURT_COOLDOWN_TICKS)) continue;

         try {
            const effect = buildHurtEffect(damage, cause);
            const loc = player.location;
            if (effect.bloodParticle) player.dimension.spawnParticle(effect.bloodParticle, loc);
            if (effect.sound) player.playSound(effect.sound.id, { location: loc, volume: effect.sound.volume });
            player.sendMessage(effect.message);
            markCooldown(this.cooldowns, player.id, tick);
         } catch {
            if (this.errorCount < MAX_QUEUE_ERRORS) {
               this.errorCount++;
               console.warn('[xVisuals] hurt_drain');
            }
         }
      }

      this.head = (head + count) & HURT_MASK;
      this.size = sz - count;
   }
}

export { XHurtQueue };
