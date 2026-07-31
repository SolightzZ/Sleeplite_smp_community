import { logError } from '../../../events/logger.js';
import { Registry } from '../../../events/registry.js';
import { pcheck } from '../../../shared/player.js';
import { BATCH_MAX_SIZE, BATCH_MIN_SIZE, TICK_RECONCILE, TICK_TARGET_LATENCY } from '../config.js';
import { isFlashlightHeld } from './held.js';
import { placeLightForPlayer, removeLightBlock } from './player-light.js';
import { syncReconcile } from './reconciler.js';
import { activeHolders, playerLights } from './state.js';

const holderOrder = [];
let _dirty = true;
let cursor = 0;
let tickCount = 0;

function rebuildOrder() {
   holderOrder.length = 0;
   for (const id of activeHolders) holderOrder.push(id);
   if (cursor >= holderOrder.length) cursor = 0;
   _dirty = false;
}

export function markStale() {
   _dirty = true;
}

export function FlashlightRunInterval() {
   try {
      tickCount++;

      if (tickCount % TICK_RECONCILE === 0) {
         syncReconcile();
         _dirty = true;
         return;
      }

      if (_dirty) rebuildOrder();
      if (holderOrder.length === 0) return;

      const batch = Math.min(BATCH_MAX_SIZE, Math.max(BATCH_MIN_SIZE, Math.ceil(holderOrder.length / TICK_TARGET_LATENCY)));

      const stale = [];

      for (let i = 0; i < batch; i++) {
         const id = holderOrder[cursor];
         cursor = (cursor + 1) % holderOrder.length;

         const entry = Registry.get(id);
         const player = entry ? entry.player : null;

         if (!player || !pcheck(player) || !isFlashlightHeld(player)) {
            stale.push(id);
            continue;
         }

         placeLightForPlayer(player);
      }

      if (stale.length > 0) {
         for (const id of stale) {
            activeHolders.delete(id);
            if (playerLights.has(id)) removeLightBlock(id);
         }
         _dirty = true;
      }
   } catch (error) {
      logError('flashlight', 'FlashlightRunInterval', error);
   }
}
