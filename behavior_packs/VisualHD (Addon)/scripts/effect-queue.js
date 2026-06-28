import { system } from '@minecraft/server';
import { MAX_EFF, EFF_MASK } from './utils.js';

const MAX_EFFECT_PER_TICK = 12;
const EFFECT_COOLDOWN_TICKS = 20;
const MAX_QUEUE_ERRORS = 10;

class XEffectQueue {
   errorCount = 0;
   players = new Array(MAX_EFF);
   messages = new Array(MAX_EFF);
   head = 0;
   size = 0;
   cooldowns = new Map();

   push(entity, message) {
      if (this.size >= MAX_EFF) return;
      const tail = (this.head + this.size) & EFF_MASK;
      this.players[tail] = entity;
      this.messages[tail] = message;
      this.size++;
   }

   removeCooldown(playerId) {
      this.cooldowns.delete(playerId);
   }

   drain() {
      let sz = this.size;
      if (sz === 0) return;
      const count = Math.min(sz, MAX_EFFECT_PER_TICK);
      const { players, messages } = this;
      let head = this.head;

      for (let i = 0; i < count; i++) {
         const idx = (head + i) & EFF_MASK;
         const player = players[idx];
         const message = messages[idx];
         players[idx] = null;
         messages[idx] = null;
         if (!player?.isValid) continue;

         const tick = system.currentTick;
         const lastTick = this.cooldowns.get(player.id) ?? 0;
         if (tick - lastTick < EFFECT_COOLDOWN_TICKS) continue;

         try {
            player.sendMessage({ translate: message });
            this.cooldowns.set(player.id, tick);
         } catch {
            if (this.errorCount < MAX_QUEUE_ERRORS) {
               this.errorCount++;
               console.warn('[xVisuals] effect_icon');
            }
         }
      }

      this.head = (head + count) & EFF_MASK;
      this.size = sz - count;
   }
}

export { XEffectQueue };
