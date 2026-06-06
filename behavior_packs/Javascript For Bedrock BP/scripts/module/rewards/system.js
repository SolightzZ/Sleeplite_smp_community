import { CommandPermissionLevel, CustomCommandStatus, system, world } from '@minecraft/server';
import { config } from './constants.js';
import { load, reset } from './database.js';
import { menu } from './logic.js';

function RewarditemUse(event) {
    const player = event.source || event;
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

                if (!player || !player.isValid) {
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
        console.error('[ Reward ] Failed to register commands: ' + error);
    }
}

function RewardchatSend(event) {
    const player = event.sender;
    const message = event.message;

    if (!player.hasTag(config.adminTag)) return;

    if (message === '!reset-login') {
        event.cancel = true;
        reset(player);
        player.sendMessage('§e[Admin] Data Reset!');
    } else if (message === '!check-reward') {
        event.cancel = true;
        let statusText = '=== Player Status ===\n';

        for (const target of world.getPlayers()) {
            const data = load(target);
            statusText += `§7${target.name}: Count=${data.count}, Last=${data.last || 'Never'}\n`;
        }
        console.warn(statusText);
        player.sendMessage(statusText);
    }
}

export { RewarditemUse, RewardchatSend, RegisterRewards };
