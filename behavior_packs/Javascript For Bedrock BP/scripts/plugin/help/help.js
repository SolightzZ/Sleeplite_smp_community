import { CommandPermissionLevel, CustomCommandStatus, system } from '@minecraft/server';
import { cache } from '../../shared/cache.js';
import { pcheck } from './../../shared/player.js';
import { dy } from './help_Durability.js';
import { ADMIN_HELP_TEXT, HELP_TEXT, RULE_TEXT, VOTE_TEXT, WEBSITES_TEXT } from './hhelpConfig.js';

const showHelp = (player) => {
   cache.sendMessage(player, HELP_TEXT);
   if (player.hasTag('admin')) cache.sendMessage(player, ADMIN_HELP_TEXT);
};

const showRule = (player) => {
   cache.sendMessage(player, RULE_TEXT);
};

const showWebsites = (player) => {
   cache.sendMessage(player, WEBSITES_TEXT);
};

const showVote = (player) => {
   cache.sendMessage(player, VOTE_TEXT);
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
         if (!pcheck(player))
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

export const RegisterRule = (init) => {
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
      },
   );
};

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
      },
   );
};

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
      },
   );
};
