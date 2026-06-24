import { CommandPermissionLevel, CustomCommandStatus, system } from '@minecraft/server';

import { startCinematicNow } from '../core/poller.js';
import { logError } from '../../../router/core/logger.js';

function quickCommandAFK(origin) {
   try {
      const player = origin.sourceEntity;
      if (!player?.isValid) return { status: CustomCommandStatus.Failure };
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
