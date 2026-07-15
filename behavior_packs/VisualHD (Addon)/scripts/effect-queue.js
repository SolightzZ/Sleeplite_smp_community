import { system } from '@minecraft/server';
import { QUEUE, SPAWN_LIMITS, COOLDOWNS, ERROR_LIMITS } from './config.js';
import { deleteCooldown, isCooldownActive, markCooldown } from './utils.js';
import { pcheck } from './shared/player.js';

const { MAX_EFF, EFF_MASK } = QUEUE;
const MAX_EFFECT_PER_TICK = SPAWN_LIMITS.EFFECT_PER_TICK;
const EFFECT_COOLDOWN_TICKS = COOLDOWNS.EFFECT;
const MAX_QUEUE_ERRORS = ERROR_LIMITS.MAX_QUEUE_ERRORS;

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
      deleteCooldown(this.cooldowns, playerId);
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
         if (!pcheck(player)) continue;

         const tick = system.currentTick;
         if (isCooldownActive(this.cooldowns, player.id, tick, EFFECT_COOLDOWN_TICKS)) continue;

         try {
            player.sendMessage({ translate: message });
            markCooldown(this.cooldowns, player.id, tick);
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
