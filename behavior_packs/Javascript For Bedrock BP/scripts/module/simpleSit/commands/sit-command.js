import { CommandPermissionLevel, CustomCommandStatus, system } from '@minecraft/server';
import { handleSitCommand } from '../core/sit-handler.js';

const PLAYER_TYPE = 'minecraft:player';

export const registerCustomCommandTakeASeat = (init) => {
    init.customCommandRegistry.registerCommand(
        {
            name: 'addon:sit',
            description: 'Sit down anywhere',
            permissionLevel: CommandPermissionLevel.Any,
            mandatoryParameters: [],
            cheatsRequired: false,
        },
        (origin) => {
            const player = origin.sourceEntity;
            if (!player || !player.isValid || player.typeId !== PLAYER_TYPE) {
                return {
                    status: CustomCommandStatus.Failure,
                    message: '§cPlayers only!',
                };
            }
            system.run(() => handleSitCommand(player));
            return { status: CustomCommandStatus.Success };
        },
    );
};
