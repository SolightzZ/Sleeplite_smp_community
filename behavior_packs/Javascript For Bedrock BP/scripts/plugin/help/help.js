import {
   CommandPermissionLevel,
   CustomCommandStatus,
   system,
} from '@minecraft/server';
import { dy } from './help_Durability.js';
import { cache } from '../../shared/cache.js';
import { pcheck } from './../../shared/player.js';

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

const RULE_TEXT = `§8--------- §eRule §8---------
§7[§a/§7] /rule - ดู Rule
`;


const WEBSITES_TEXT = `§8--------- §eWebsites §8---------
§7[§a/§7] /websites - ดู Websites
`;

const VOTE_TEXT = `§8--------- §eVote §8---------
§7[§a/§7] /vote - ดู Vote
`;


const showHelp = (player) => {
   cache.sendMessage(player, HELP_TEXT);
   if (player.hasTag('admin')) cache.sendMessage(player, ADMIN_HELP_TEXT);
};

const showRule = (player) => {
   cache.sendMessage(player, RULE_TEXT);
}

const showWebsites = (player) => {
   cache.sendMessage(player, WEBSITES_TEXT);
}

const showVote = (player) => {
   cache.sendMessage(player, VOTE_TEXT);
}


export const helpmain = (event) => {
   const msg = event.message;
   if (!msg) return;

   const firstChar = msg.charCodeAt(0);
   if (firstChar !== 33) return;

   const command = msg.trim().toLowerCase();

   if (command === '!help') {
      event.cancel = true;
      const player = event.sender;
      if (pcheck(player)) showHelp(player);
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
         if (!pcheck(player)) return {
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
         if (!pcheck(player)) {
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

export const RegisterRule = (init) =>{
   init.customCommandRegistry.registerCommand(
      {
         name: 'addon:rule',
         description: 'Rule',
         permissionLevel: CommandPermissionLevel.Any,
         cheatsRequired: false,
      },
      (origin) => {
         const player = origin.sourceEntity;
         if (!pcheck(player)) {
            return {
               status: CustomCommandStatus.Failure,
               message: '§cใช้ได้เฉพาะผู้เล่น',
            };
         }

         showRule(player);
         return { status: CustomCommandStatus.Success };
      }
   )
}

export const RegisterVote = (init) => {
   init.customCommandRegistry.registerCommand(
      {
         name: 'addon:vote',
         description: 'Vote',
         permissionLevel: CommandPermissionLevel.Any,
         cheatsRequired: false,
      },
      (origin) => {
         const player = origin.sourceEntity;
         if (!pcheck(player)) {
            return {
               status: CustomCommandStatus.Failure,
               message: '§cใช้ได้เฉพาะผู้เล่น',
            };
         }

         showVote(player);
         return { status: CustomCommandStatus.Success };
      }
   )
}

export const RegisterWebsites = (init) => {
   init.customCommandRegistry.registerCommand(
      {
         name: 'addon:websites',
         description: 'Websites',
         permissionLevel: CommandPermissionLevel.Any,
         cheatsRequired: false,
      },
      (origin) => {
         const player = origin.sourceEntity;
         if (!pcheck(player)) {
            return {
               status: CustomCommandStatus.Failure,
               message: '§cใช้ได้เฉพาะผู้เล่น',
            };
         }

         showWebsites(player);
         return { status: CustomCommandStatus.Success };
      }
   )
}
