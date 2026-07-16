import { CommandPermissionLevel, CustomCommandStatus, system } from '@minecraft/server';
import { logError, logWarn } from '../../events/logger.js';
import { Registry } from '../../events/registry.js';
import { cache } from '../../shared/cache.js';
import { pcheck } from './../../shared/player.js';
import { config } from './constants.js';
import { load, reset } from './database.js';
import { menu } from './logic.js';

function RewarditemUse(event) {
   const player = event?.source || event;
   if (!pcheck(player)) return;
   menu(player);
}

function RegisterRewards(init) {
   try {
      init.customCommandRegistry.registerCommand(
         {
            name: 'addon:rw',
            description: 'Rewards - รับรางวัลล็อกอิน',
            permissionLevel: CommandPermissionLevel.Any,
            cheatsRequired: false,
         },
         (origin) => {
            const player = origin.sourceEntity;

            if (!pcheck(player)) {
               return {
                  status: CustomCommandStatus.Failure,
                  message: '§cThis command can only be used by players!',
               };
            }
            system.run(() => RewarditemUse(player));
            return {
               status: CustomCommandStatus.Success,
            };
         },
      );
   } catch (error) {
      logError('Reward', 'Failed to register commands', error);
   }
}

function RewardchatSend(event) {
   const player = event.sender;
   const message = event.message;

   if (!pcheck(player) || !player.hasTag(config.adminTag)) return;

   if (message === '!reset-login') {
      event.cancel = true;
      reset(player);
      cache.sendMessage(player, '§e[Admin] Data Reset!');
   } else if (message === '!check-reward') {
      event.cancel = true;
      let statusText = '=== Player Status ===\n';

      for (const target of Registry.getPlayers()) {
         const data = load(target);
         statusText += `§7${target.name}: Count=${data.count}, Last=${data.last || 'Never'}\n`;
      }
      logWarn('Rewards', statusText);
      cache.sendMessage(player, statusText);
   }
}

export { RegisterRewards, RewardchatSend, RewarditemUse };
