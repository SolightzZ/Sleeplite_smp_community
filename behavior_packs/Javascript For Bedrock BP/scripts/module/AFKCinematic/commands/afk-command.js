import { CommandPermissionLevel, CustomCommandStatus, system } from '@minecraft/server';
import { logError } from '../../../events/logger.js';
import { startCinematicNow } from '../core/poller.js';
import { pcheck } from './../../../shared/player.js';

function quickCommandAFK(origin) {
   try {
      const player = origin.sourceEntity;
      if (!pcheck(player)) return { status: CustomCommandStatus.Failure };
      system.run(() => startCinematicNow(player));
      return { status: CustomCommandStatus.Success };
   } catch (error) {
      logError('AFKCinematic', 'quickCommandAFK', error);
      return { status: CustomCommandStatus.Failure };
   }
}

export function registerCommandAFK(init) {
   try {
      init.customCommandRegistry.registerCommand(
         {
            name: 'addon:afk',
            description: 'Enter AFK Cinematic mode immediately.',
            permissionLevel: CommandPermissionLevel.Any,
            cheatsRequired: false,
         },
         quickCommandAFK,
      );
   } catch (error) {
      logError('AFKCinematic', 'registerCommandAFK', error);
   }
}
