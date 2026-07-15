import { system, world } from '@minecraft/server';
import { kickPlayer } from '@minecraft/server-admin';
import { logError } from '../../../events/logger.js';
import { Registry } from '../../../events/registry.js';
import { Config } from '../config.js';
import { formatDate, formatDuration, formatRemaining } from '../utils/format.js';
import { BanDatabase } from './database.js';
import { cache } from '../../../shared/cache.js';
import { pcheck } from './../../../shared/player.js';
import { nowUnix } from '../../../shared/datetime.js';

// ส่งเตะผู้เล่น
const execKick = (player, reason) => {
   try {
      if (!pcheck(player)) return false;

      system.run(() => {
         if (!pcheck(player)) return;
         kickPlayer(player, reason);
      });
      return true;
   } catch (error) {
      logError('Ban', 'kickPlayer failed for ' + (player?.name || 'unknown'), error);
      return false;
   }
};

const buildBanMessage = (entry) => {
   const lines = [`§4คุณถูกแบนจากเซิร์ฟเวอร์!`, `§7==============================`, `§cสาเหตุ: §f${entry.reason}`];

   if (entry.duration === 0) {
      lines.push(`§cระยะเวลา: §fถาวร`);
   } else {
      lines.push(`§cระยะเวลา: §f${formatDuration(entry.duration)}`);
      lines.push(`§cสิ้นสุดวันที่: §f${formatDate(entry.expiresAt)}`);
      lines.push(`§cระยะเวลาที่เหลือ: §f${formatRemaining(entry.expiresAt)}`);
   }

   lines.push(`§cดำเนินการโดย: §f${entry.bannedBy}`, `§cวันเวลาที่ดำเนินการ: §f${formatDate(entry.bannedAt)}`, `§7==============================`);

   return lines.join('\n');
};

export const kickAndNotify = (player, reason, adminName) => {
   try {
      if (!pcheck(player)) return false;

      cache.sendMessage(player, `§4คุณถูกเชิญออกจากเซิร์ฟเวอร์`);
      cache.sendMessage(player, `§cสาเหตุ: §f${reason}`);
      cache.sendMessage(player, `§cดำเนินการโดย: §f${adminName}`);

      return execKick(player, reason);
   } catch (error) {
      logError('Ban', 'kickPlayer error', error);
      return false;
   }
};

export const banPlayer = (name, reason, duration, adminPlayer) => {
   try {
      if (!pcheck(adminPlayer)) return { ok: false, message: 'Invalid admin' };

      if (adminPlayer.name === name) {
         return {
            ok: false,
            message: `§c[x] ไม่สามารถแบนตัวเองได้`,
         };
      }

      for (const target of Registry.getPlayers()) {
         if (target.name === name && target.hasTag(Config.adminTag)) {
            return {
               ok: false,
               message: `§c[x] ไม่สามารถแบนผู้ดูแลระบบได้`,
            };
         }
      }

      const existing = BanDatabase.get(name);
      if (existing) {
         const stillBanned = existing.duration === 0 || existing.expiresAt > nowUnix();
         if (stillBanned) {
            return {
               ok: false,
               message: `§c[x] ผู้เล่น ${name} ถูกแบนอยู่แล้วในระบบ`,
            };
         }
      }

      BanDatabase.add(name, reason, duration, adminPlayer.name);
      cache.sendMessage(adminPlayer, `${'§a'}[/] แบนผู้เล่น ${name} เสร็จสิ้น`);

      for (const target of cache.getPlayers()) {
         if (target.name === name && pcheck(target)) {
            const entry = BanDatabase.get(name);
            cache.sendMessage(target, buildBanMessage(entry));
            execKick(target, reason);
            break;
         }
      }

      return { ok: true };
   } catch (error) {
      logError('Ban', 'banPlayer error', error);
      return {
         ok: false,
         message: `§c[x] เกิดข้อผิดพลาดในการดำเนินการแบนผู้เล่น`,
      };
   }
};

export const unbanPlayer = (name, adminPlayer) => {
   try {
      if (!pcheck(adminPlayer)) return { ok: false, message: 'Invalid admin' };

      const existing = BanDatabase.get(name);
      if (!existing) {
         return {
            ok: false,
            message: `§c[x] ไม่พบประวัติการแบนของ ${name}`,
         };
      }

      BanDatabase.remove(name);
      cache.sendMessage(adminPlayer, `§a[/] ปลดแบนผู้เล่น ${name} เสร็จสิ้น`);
      return { ok: true };
   } catch (error) {
      logError('Ban', 'unbanPlayer error', error);
      return {
         ok: false,
         message: `§c[x] เกิดข้อผิดพลาดในการปลดแบนผู้เล่น`,
      };
   }
};

export const checkBanOnJoin = (player) => {
   try {
      const entry = BanDatabase.get(player.name);
      if (!entry) return false;

      const now = nowUnix();
      if (entry.duration !== 0 && entry.expiresAt <= now) {
         BanDatabase.remove(player.name);
         return false;
      }

      cache.sendMessage(player, buildBanMessage(entry));
      execKick(player, entry.reason);
      return true;
   } catch (error) {
      logError('Ban', 'checkBanOnJoin error', error);
      return false;
   }
};

export const getBanList = () => {
   return BanDatabase.getAll();
};
