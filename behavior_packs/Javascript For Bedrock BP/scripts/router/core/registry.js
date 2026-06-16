import { world, system } from '@minecraft/server';
import { logError } from './logger.js';

const _registry = new Map();
const _entriesBuf = []; // นำบัฟเฟอร์กลับมาใช้ใหม่เพื่อป้องกันการจัดสรรหน่วยความจำสำหรับ GC
const _playersBuf = []; // บัฟเฟอร์สำหรับอาร์เรย์ผู้เล่นเพื่อลดการสร้างขยะ/วัตถุใหม่ในหน่วยความจำ

export const Registry = {
   add(player) {
      if (!player || !player.isValid || _registry.has(player.id)) return;
      _registry.set(player.id, {
         player,
         data: { kills: 0, deaths: 0, coins: 0, afkTicks: 0 },
         joinedAt: Date.now(),
      });
   },

   remove(playerId) {
      _registry.delete(playerId);
   },

   get(id) {
      return _registry.get(id) ?? null;
   },

   getData(id) {
      return _registry.get(id)?.data ?? null;
   },

   getAll() {
      return _registry;
   },

   // คืนค่าบัฟเฟอร์ของผู้เล่นที่ออนไลน์ในปัจจุบัน (เป็นมิตรกับ GC)
   // คำเตือน: อาร์เรย์ที่ส่งคืนเป็น Shared Mutable Reference ห้ามเก็บแคชข้าม Tick
   getEntries() {
      _entriesBuf.length = 0;
      for (const entry of _registry.values()) {
         if (entry.player?.isValid) {
            _entriesBuf.push(entry);
         }
      }
      return _entriesBuf;
   },

   // คืนค่าบัฟเฟอร์ของออบเจกต์ Player ของผู้เล่นที่ออนไลน์ในปัจจุบัน (เป็นมิตรกับ GC)
   // คำเตือน: อาร์เรย์ที่ส่งคืนเป็น Shared Mutable Reference ห้ามเก็บแคชข้าม Tick
   getPlayers() {
      _playersBuf.length = 0;
      for (const entry of _registry.values()) {
         if (entry.player?.isValid) {
            _playersBuf.push(entry.player);
         }
      }
      return _playersBuf;
   },

   // กวาดล้างเอนทิตีที่ใช้งานไม่ได้ (ป้องกันปัญหาหน่วยความจำรั่วไหล)
   sweep() {
      for (const [id, entry] of _registry) {
         if (!entry.player?.isValid) {
            _registry.delete(id);
         }
      }
   },

   get size() {
      return _registry.size;
   },

   // ซิงค์รายชื่อผู้เล่นที่ออนไลน์อยู่ตอนนี้ (โดยเฉพาะหลังจากใช้คำสั่ง /reload)
   init() {
      try {
         for (const player of world.getAllPlayers()) {
            this.add(player);
         }
      } catch (error) {
         logError('Registry', 'Failed to initialize existing players', error);
      }
   },
};

// กวาดล้างขยะเป็นระยะทุกๆ 30 วินาที (600 ticks)
system.runInterval(() => {
   Registry.sweep();
}, 600);
