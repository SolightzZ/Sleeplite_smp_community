import { system, world } from '@minecraft/server';
import { kickPlayer } from '@minecraft/server-admin';
import { logError } from '../../../router/core/logger.js';
import { Registry } from '../../../router/core/registry.js';
import { Config } from '../config.js';
import { formatDate, formatDuration, formatRemaining } from '../utils/format.js';
import { BanDatabase } from './database.js';

// ส่งเตะผู้เล่น
const execKick = (player, reason) => {
   try {
      if (!player?.isValid) return false;

      system.run(() => {
         if (!player.isValid) return;
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
      if (!player?.isValid) return false;

      player.sendMessage(`§4คุณถูกเชิญออกจากเซิร์ฟเวอร์`);
      player.sendMessage(`§cสาเหตุ: §f${reason}`);
      player.sendMessage(`§cดำเนินการโดย: §f${adminName}`);

      return execKick(player, reason);
   } catch (error) {
      logError('Ban', 'kickPlayer error', error);
      return false;
   }
};

export const banPlayer = (name, reason, duration, adminPlayer) => {
   try {
      if (!adminPlayer || !adminPlayer.isValid) return { ok: false, message: 'Invalid admin' };

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
         const stillBanned = existing.duration === 0 || existing.expiresAt > Math.floor(Date.now() / 1000);
         if (stillBanned) {
            return {
               ok: false,
               message: `§c[x] ผู้เล่น ${name} ถูกแบนอยู่แล้วในระบบ`,
            };
         }
      }

      BanDatabase.add(name, reason, duration, adminPlayer.name);
      adminPlayer.sendMessage(`${'§a'}[/] แบนผู้เล่น ${name} เสร็จสิ้น`);

      for (const target of world.getPlayers()) {
         if (target.name === name && target.isValid) {
            const entry = BanDatabase.get(name);
            target.sendMessage(buildBanMessage(entry));
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
      if (!adminPlayer || !adminPlayer.isValid) return { ok: false, message: 'Invalid admin' };

      const existing = BanDatabase.get(name);
      if (!existing) {
         return {
            ok: false,
            message: `§c[x] ไม่พบประวัติการแบนของ ${name}`,
         };
      }

      BanDatabase.remove(name);
      adminPlayer.sendMessage(`§a[/] ปลดแบนผู้เล่น ${name} เสร็จสิ้น`);
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

      const now = Math.floor(Date.now() / 1000);
      if (entry.duration !== 0 && entry.expiresAt <= now) {
         BanDatabase.remove(player.name);
         return false;
      }

      player.sendMessage(buildBanMessage(entry));
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
