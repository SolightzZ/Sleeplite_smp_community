import { system, CustomCommandStatus } from '@minecraft/server';
import { pcheck, pisPlayer } from './../../shared/player.js';
import { showServerMenu } from './Transfer.js';
import { COMMAND } from './config.js';

const quickServersCommand = (origin) => {
   const player = origin.sourceEntity;

   if (!pisPlayer(player)) {
      return { status: CustomCommandStatus.Failure };
   }

   system.run(() => {
      if (pcheck(player)) showServerMenu(player);
   });

   return { status: CustomCommandStatus.Success };
};

export function registerCommands(init) {
   init.customCommandRegistry.registerCommand(
      {
         name: COMMAND.name,
         description: COMMAND.description,
         permissionLevel: COMMAND.permissionLevel,
      },
      quickServersCommand,
   );
}
