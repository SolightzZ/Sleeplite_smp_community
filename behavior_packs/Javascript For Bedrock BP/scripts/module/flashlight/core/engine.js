import { Registry } from '../../../events/registry.js';
import { BATCH_MAX_SIZE, BATCH_MIN_SIZE, TICK_RECONCILE, TICK_TARGET_LATENCY } from '../config.js';
import { pcheck } from './../../../shared/player.js';
import { isFlashlightHeld, placeLightForPlayer, removeLightBlock } from './light-manager.js';
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

function syncReconcile() {
   const allPlayers = Registry.getPlayers();

   activeHolders.clear();
   for (const player of allPlayers) {
      if (pcheck(player) && isFlashlightHeld(player)) {
         activeHolders.add(player.id);
      }
   }

   for (const trackedId of playerLights.keys()) {
      if (!activeHolders.has(trackedId)) {
         removeLightBlock(trackedId);
      }
   }

   _dirty = true;
}

export function FlashlightRunInterval() {
   tickCount++;

   if (tickCount % TICK_RECONCILE === 0) {
      syncReconcile();
      return;
   }

   if (_dirty) rebuildOrder();
   if (holderOrder.length === 0) return;

   const batch = Math.min(BATCH_MAX_SIZE, Math.max(BATCH_MIN_SIZE, Math.ceil(holderOrder.length / TICK_TARGET_LATENCY)));

   for (let i = 0; i < batch; i++) {
      if (_dirty) rebuildOrder();
      if (holderOrder.length === 0) return;

      const n = holderOrder.length;
      const id = holderOrder[cursor];
      cursor = (cursor + 1) % n;

      const entry = Registry.get(id);
      const player = entry ? entry.player : null;

      if (!player || !pcheck(player) || !isFlashlightHeld(player)) {
         activeHolders.delete(id);
         if (playerLights.has(id)) removeLightBlock(id, player ? player.dimension : undefined);
         _dirty = true;
         continue;
      }

      placeLightForPlayer(player, true);
   }
}

export function flashSpawn(event) {
   const player = event.player;
   if (!pcheck(player)) return;
   if (isFlashlightHeld(player)) {
      activeHolders.add(player.id);
      _dirty = true;
   }
}

export function flashLeave(playerId) {
   removeLightBlock(playerId);
   activeHolders.delete(playerId);
   _dirty = true;
}
