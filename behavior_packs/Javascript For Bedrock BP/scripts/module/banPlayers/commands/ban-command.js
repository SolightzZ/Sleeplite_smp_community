import {
   CommandPermissionLevel,
   CustomCommandParamType,
} from '@minecraft/server';
import { Config } from '../config.js';
import {
   banPlayer,
   unbanPlayer,
   kickAndNotify,
   getBanList,
} from '../core/ban.js';
import {
   cmdResult,
   requireAdmin,
   validateCommandTargets,
   getOrValidateDuration,
} from '../utils/validation.js';
import { formatRemaining } from '../utils/format.js';
import { defaultBanReason, defaultKickReason } from '../data/messages.js';

const iterateTargets = (targets, fn) => {
   for (const target of targets) {
      if (target?.isValid) fn(target);
   }
};


const registerAdminCommand = (init, options, handler) => {
   try {
      init.customCommandRegistry.registerCommand(options, (origin, ...args) => {
         try {
            const player = requireAdmin(origin);
            if (!player) {
               return cmdResult.failure(
                  '§cท่านไม่มีสิทธิ์การใช้งานคำสั่งดังกล่าว',
               );
            }
            return handler(player, ...args);
         } catch (error) {
            console.error(
               `[BanCommand] เกิดข้อผิดพลาดในคำสั่ง ${options.name}:`,
               error.name,
               error.message,
            );
            return cmdResult.failure('§cเกิดข้อผิดพลาดในการดำเนินงานของคำสั่ง');
         }
      });
   } catch (error) {
      console.warn(
         `[BanCommand] ไม่สามารถลงทะเบียนคำสั่ง ${options.name} ได้:`,
         error.name,
         error.message,
      );
   }
};

export const registerBanCommands = (init) => {
   // คำสั่งแบนผู้เล่น (Ban)
   registerAdminCommand(
      init,
      {
         name: 'addon:ban',
         description: 'แบนผู้เล่นออกจากเซิร์ฟเวอร์',
         permissionLevel: CommandPermissionLevel.Any,
         mandatoryParameters: [
            { name: 'target', type: CustomCommandParamType.PlayerSelector },
         ],
         optionalParameters: [
            { name: 'duration', type: CustomCommandParamType.String },
            { name: 'reason', type: CustomCommandParamType.String },
         ],
         cheatsRequired: true,
      },
      (player, targetPlayers, durationStr, reason) => {
         const validation = validateCommandTargets(targetPlayers, 'แบน');
         if (!validation.ok) return cmdResult.failure(validation.error);

         const finalReason =
            reason && String(reason).trim() !== ''
               ? String(reason)
               : defaultBanReason;
         const durationResult = getOrValidateDuration(
            durationStr,
            Config.defaultDuration,
         );

         if (!durationResult.ok) {
            return cmdResult.failure(
               '§cรูปแบบเวลาไม่ถูกต้อง กรุณาใช้รูปแบบ เช่น 7d (วัน), 7h (ชั่วโมง), 30m (นาที) perm(ถาวร)',
            );
         }

         iterateTargets(validation.targets, (target) => {
            banPlayer(
               target.name,
               String(finalReason),
               durationResult.seconds,
               player,
            );
         });

         return cmdResult.success;
      },
   );

   // คำสั่งปลดแบนผู้เล่น (Unban)
   registerAdminCommand(
      init,
      {
         name: 'addon:unban',
         description: 'ปลดแบนผู้เล่นออกจากเซิร์ฟเวอร์',
         permissionLevel: CommandPermissionLevel.Any,
         mandatoryParameters: [
            { name: 'target', type: CustomCommandParamType.String },
         ],
         cheatsRequired: true,
      },
      (player, targetName) => {
         if (!targetName || typeof targetName !== 'string') {
            return cmdResult.failure('§cกรุณาระบุชื่อผู้เล่นที่ต้องการปลดแบน');
         }

         unbanPlayer(String(targetName), player);
         return cmdResult.success;
      },
   );

   // คำสั่งเชิญผู้เล่นออกจากเซิร์ฟเวอร์ (Kick)
   registerAdminCommand(
      init,
      {
         name: 'addon:kick',
         description: 'เชิญผู้เล่นออกจากเซิร์ฟเวอร์ (เตะ)',
         permissionLevel: CommandPermissionLevel.Any,
         mandatoryParameters: [
            { name: 'target', type: CustomCommandParamType.PlayerSelector },
         ],
         optionalParameters: [
            { name: 'reason', type: CustomCommandParamType.String },
         ],
         cheatsRequired: true,
      },
      (player, targetPlayers, reason) => {
         const validation = validateCommandTargets(targetPlayers, 'เตะ');
         if (!validation.ok) return cmdResult.failure(validation.error);

         const finalReason =
            reason && String(reason).trim() !== ''
               ? String(reason)
               : defaultKickReason;

         iterateTargets(validation.targets, (target) => {
            kickAndNotify(target, String(finalReason), player.name);
         });

         return cmdResult.success;
      },
   );

   // คำสั่งแสดงรายชื่อผู้เล่นที่ถูกแบน (Banlist)
   registerAdminCommand(
      init,
      {
         name: 'addon:banlist',
         description: 'แสดงรายชื่อผู้เล่นที่ถูกแบน',
         permissionLevel: CommandPermissionLevel.Any,
         optionalParameters: [],
         cheatsRequired: false,
      },
      (player) => {
         if (!player.isValid) return cmdResult.success;
         const bans = getBanList();
         if (bans.length === 0) {
            player.sendMessage(`${'§7'}[!] ไม่พบข้อมูลผู้เล่นที่ถูกแบน`);
            return cmdResult.success;
         }

         player.sendMessage(`§6===== รายชื่อผู้ถูกแบน (${bans.length}) =====`);
         for (const ban of bans) {
            const remaining =
               ban.duration === 0
                  ? '§cถาวร'
                  : `§e${formatRemaining(ban.expiresAt)}`;
            player.sendMessage(
               `§7- §f${ban.name} §7| สาเหตุ: §f${ban.reason} §7| ระยะเวลาที่เหลือ: ${remaining} §7| ดำเนินการโดย: §f${ban.bannedBy}`,
            );
         }

         return cmdResult.success;
      },
   );
};
