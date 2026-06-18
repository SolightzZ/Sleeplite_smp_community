import {
   CommandPermissionLevel,
   CustomCommandStatus,
   system,
} from '@minecraft/server';
import { dy } from './help_Durability.js';

const HELP_TEXT = `§8--------- §eHelper §8---------
§7[§a/§7] /addon:help - คําสั่งต่างๆ
§7[§a/§7] /server Quick Server - เข้าร่วมเซิร์ฟเวอร์อื่นๆ
§7[§a/§7] /msg <ข้อความ> - ส่งข้อความส่วนตัว
§7[§a/§7] /sit Sit - ที่นั่ง
§7[§a/§7] /rw Rwards - รับรางวัลล็อกอิน
§7[§a/§7] /r <ชื่อการเรียง> - เรียงไอเทมในตัว
§7[§a/§7] /c <ชื่อการเรียง> - เรียงไอเทมในกล่อง
§7[§a/§7] /xz <พิกัด x> <พิกัด z> - คำนวณพิกัดเนเทอร์
§7[§a/§7] /d Durability - แสดงความทนทานไอเทมในตัว และ แสดงแท็กชื่อ
`;

const ADMIN_HELP_TEXT = `§8--------- §cHelper Admin §8---------
§7[§c/§7] !json - แสดงข้อมูล JSON Protection
§7[§c/§7] !reset-login - รีเซ็ตข้อมูล Reward
§7[§c/§7] !check-reward - แสดงข้อมูลล็อกอิน JSON Reward
§7[§c/§7] /ban <ผู้เล่น> [ระยะเวลา] [เหตุผล] - แบนผู้เล่น
§7[§c/§7] /unban <ชื่อ> - ปลดแบนผู้เล่น
§7[§c/§7] /kick <ผู้เล่น> [เหตุผล] - เตะผู้เล่น
§7[§c/§7] /banlist - ดูรายชื่อคนถูกแบน
`;

const showHelp = (player) => {
   player.sendMessage(HELP_TEXT);
   if (player.hasTag('admin')) player.sendMessage(ADMIN_HELP_TEXT);
};

export const helpmain = (event) => {
   const msg = event.message;
   if (!msg) return;

   const firstChar = msg.charCodeAt(0);
   if (firstChar !== 33) return;

   const command = msg.trim().toLowerCase();

   if (command === '!help') {
      event.cancel = true;
      const player = event.sender;
      if (player?.isValid) showHelp(player);
      return;
   }
};

export const RegisterDurability = (init) => {
   init.customCommandRegistry.registerCommand(
      {
         name: 'addon:d',
         description: '§7แสดงความทนทานไอเทมในตัว',
         permissionLevel: CommandPermissionLevel.Any,
         cheatsRequired: false,
      },
      (origin) => {
         const player = origin.sourceEntity;
         if (!player?.isValid)
            return {
               status: CustomCommandStatus.Failure,
               message: '§cใช้ได้เฉพาะผู้เล่น',
            };
         system.run(() => dy(player));
         return { status: CustomCommandStatus.Success };
      },
   );
};

export const RegisterHelp = (init) => {
   init.customCommandRegistry.registerCommand(
      {
         name: 'addon:help',
         description: 'Help - คําสั่งต่างๆ',
         permissionLevel: CommandPermissionLevel.Any,
         cheatsRequired: false,
      },
      (origin) => {
         const player = origin.sourceEntity;
         if (!player?.isValid) {
            return {
               status: CustomCommandStatus.Failure,
               message: '§cใช้ได้เฉพาะผู้เล่น',
            };
         }

         showHelp(player);
         return { status: CustomCommandStatus.Success };
      },
   );
};
