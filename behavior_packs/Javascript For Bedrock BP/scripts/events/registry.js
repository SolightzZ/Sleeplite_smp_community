import { world, system } from '@minecraft/server';
import { logError } from './logger.js';

const _registry = new Map();
const _entriesBuf = []; // ใช้บัฟเฟอร์ซ้ำ ลด GC allocation
const _playersBuf = []; // บัฟเฟอร์อาร์เรย์ผู้เล่น ลด GC pressure

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

    // คืนบัฟเฟอร์รายการผู้เล่นที่ reuse ได้ (GC-friendly)
    // คำเตือน: ตัวแปรอ้างอิงร่วมกัน ห้าม cache ข้าม tick
   getEntries() {
      _entriesBuf.length = 0;
      for (const entry of _registry.values()) {
         if (entry.player?.isValid) {
            _entriesBuf.push(entry);
         }
      }
      return _entriesBuf;
   },

    // คืนบัฟเฟอร์ Player objects ที่ reuse ได้ (GC-friendly)
    // คำเตือน: ตัวแปรอ้างอิงร่วมกัน ห้าม cache ข้าม tick
   getPlayers() {
      _playersBuf.length = 0;
      for (const entry of _registry.values()) {
         if (entry.player?.isValid) {
            _playersBuf.push(entry.player);
         }
      }
      return _playersBuf;
   },

    // ลบผู้เล่นที่เชื่อมต่อไม่ถูกต้องแล้วออก ป้องกัน memory leak
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

    // ซิงค์ผู้เล่นที่ออนไลน์เข้า Registry (ใช้ตอนโหลดโลกหรือ /reload)
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

// sweep ผู้เล่นที่หลุดทุก 30 วินาที (600 ticks)
system.runInterval(() => {
   Registry.sweep();
}, 600);
