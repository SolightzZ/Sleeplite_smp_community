import { system } from '@minecraft/server';
import { CONFIG } from '../config.js';

const _snapshots = new Map();

export function setSnapshot(playerId, detail, playerInv, chestInv) {
   const old = _snapshots.get(playerId);
   if (old?.timeoutId !== undefined) {
      system.clearRun(old.timeoutId);
   }

   const entry = {
      detail,
      playerInv,
      chestInv,
      createdAt: Date.now(),

      timeoutId: system.runTimeout(() => {
         _snapshots.delete(playerId);
      }, CONFIG.SNAPSHOT_TIMEOUT_TICKS),
   };
   _snapshots.set(playerId, entry);
}

export function getSnapshotEntry(playerId) {
   return _snapshots.get(playerId) ?? null;
}

export function hasActiveSnapshot(playerId) {
   return _snapshots.has(playerId);
}

export function removeSnapshot(playerId) {
   const entry = _snapshots.get(playerId);
   if (entry?.timeoutId !== undefined) {
      system.clearRun(entry.timeoutId);
   }
   _snapshots.delete(playerId);
}
