import { system } from '@minecraft/server';
import { MAX_HURT, HURT_MASK, buildHurtEffect } from './utils.js';

const MAX_HURT_PER_TICK = 8;
const HURT_COOLDOWN_TICKS = 10;
const MAX_QUEUE_ERRORS = 10;

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
      this.cooldowns.delete(playerId);
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
         if (!player || !player.isValid) continue;

         const tick = system.currentTick;
         const lastTick = this.cooldowns.get(player.id) ?? 0;
         if (tick - lastTick < HURT_COOLDOWN_TICKS) continue;

         try {
            const effect = buildHurtEffect(damage, cause);
            const loc = player.location;
            if (effect.bloodParticle) player.dimension.spawnParticle(effect.bloodParticle, loc);
            if (effect.sound) player.playSound(effect.sound.id, { location: loc, volume: effect.sound.volume });
            player.sendMessage(effect.message);
            this.cooldowns.set(player.id, tick);
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
