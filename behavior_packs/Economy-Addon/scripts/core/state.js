import { system } from '@minecraft/server';
import { CONFIG } from '../config.js';

// snapshot ต่อผู้เล่น — เก็บ inventory ก่อนทำธุรกรรมเผื่อต้อง rollback กลับ
const _snapshots = new Map();

// ตั้งค่า snapshot สำหรับผู้เล่น — ถ้ามี snapshot เก่าอยู่ให้ลบ timeout ทิ้งก่อน
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


export function getSnapshot(playerId) {
   return _snapshots.get(playerId)?.detail ?? null;
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
