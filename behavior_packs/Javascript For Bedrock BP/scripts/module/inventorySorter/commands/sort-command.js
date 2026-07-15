import { CommandPermissionLevel, CustomCommandParamType, CustomCommandStatus, system } from '@minecraft/server';
import { cmdSortContainer, cmdSortInv, enumSortMode, SortModes } from '../config.js';
import { sortBlockContainer, sortPlayerInventory } from '../core/sorter.js';
import { cache } from '../../../shared/cache.js';
import { pcheck } from './../../../shared/player.js';

const MODE_ENUM = Object.keys(SortModes);

const cmdSortInventory = (origin, mode) => {
    const player = origin.sourceEntity;
    if (!pcheck(player)) return { status: CustomCommandStatus.Failure };

    system.run(() => {
        if (!pcheck(player)) return;

        const res = sortPlayerInventory(player, mode);
        if (res.msg) {
            const modeKey = mode?.toString().toLowerCase() ?? 'type';
            const description = SortModes[modeKey]?.description ?? SortModes.type.description;
            cache.sendMessage(player, `${res.msg} (${description})`);
        }
    });

    return { status: CustomCommandStatus.Success };
};

const cmdSortContainer = (origin, mode) => {
    const player = origin.sourceEntity;
    if (!pcheck(player)) return { status: CustomCommandStatus.Failure };

    system.run(() => {
        if (!pcheck(player)) return;

        const res = sortBlockContainer(player, mode);
        if (res.msg) {
            const modeKey = mode?.toString().toLowerCase() ?? 'type';
            const description = SortModes[modeKey]?.description ?? SortModes.type.description;
            cache.sendMessage(player, `${res.msg} (${description})`);
        }
    });

    return { status: CustomCommandStatus.Success };
};

export function registerSortCommands(init) {
    init.customCommandRegistry.registerEnum(enumSortMode, MODE_ENUM);

    init.customCommandRegistry.registerCommand(
        {
            name: cmdSortInv,
            description: 'จัดเรียงช่องเก็บของส่วนตัว',
            permissionLevel: CommandPermissionLevel.Any,
            cheatsRequired: false,
            optionalParameters: [
                {
                    name: 'mode',
                    type: CustomCommandParamType.Enum,
                    enumName: enumSortMode,
                },
            ],
        },
        cmdSortInventory,
    );

    init.customCommandRegistry.registerCommand(
        {
            name: cmdSortContainer,
            description: 'จัดเรียงที่เก็บของในบล็อก',
            permissionLevel: CommandPermissionLevel.Any,
            cheatsRequired: false,
            optionalParameters: [
                {
                    name: 'mode',
                    type: CustomCommandParamType.Enum,
                    enumName: enumSortMode,
                },
            ],
        },
        cmdSortContainer,
    );
}
