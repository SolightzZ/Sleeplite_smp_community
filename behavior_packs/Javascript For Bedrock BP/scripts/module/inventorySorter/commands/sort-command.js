import {
  CommandPermissionLevel,
  CustomCommandParamType,
  CustomCommandStatus,
  system,
} from "@minecraft/server";
import { SortModes } from "../config.js";
import { sortBlockContainer, sortPlayerInventory } from "../core/sorter.js";

const MODE_ENUM = Object.keys(SortModes);

const cmdSortInventory = (origin, mode) => {
  const player = origin.sourceEntity;
  if (!player?.isValid) return { status: CustomCommandStatus.Failure };

  system.run(() => {
    if (!player.isValid) return;

    const res = sortPlayerInventory(player, mode);
    if (res.msg) {
      const modeKey = mode?.toString().toLowerCase() ?? "type";
      const description = SortModes[modeKey]?.description ?? SortModes.type.description;
      player.sendMessage(`${res.msg} (${description})`);
    }
  });

  return { status: CustomCommandStatus.Success };
};

const cmdSortContainer = (origin, mode) => {
  const player = origin.sourceEntity;
  if (!player?.isValid) return { status: CustomCommandStatus.Failure };

  system.run(() => {
    if (!player.isValid) return;

    const res = sortBlockContainer(player, mode);
    if (res.msg) {
      const modeKey = mode?.toString().toLowerCase() ?? "type";
      const description = SortModes[modeKey]?.description ?? SortModes.type.description;
      player.sendMessage(`${res.msg} (${description})`);
    }
  });

  return { status: CustomCommandStatus.Success };
};

export function registerSortCommands(init) {
  init.customCommandRegistry.registerEnum("addon:SortingMode", MODE_ENUM);

  init.customCommandRegistry.registerCommand(
    {
      name: "addon:r",
      description: "จัดเรียงช่องเก็บของส่วนตัว",
      permissionLevel: CommandPermissionLevel.Any,
      cheatsRequired: false,
      optionalParameters: [
        {
          name: "mode",
          type: CustomCommandParamType.Enum,
          enumName: "addon:SortingMode",
        },
      ],
    },
    cmdSortInventory,
  );

  init.customCommandRegistry.registerCommand(
    {
      name: "addon:c",
      description: "จัดเรียงที่เก็บของในบล็อก",
      permissionLevel: CommandPermissionLevel.Any,
      cheatsRequired: false,
      optionalParameters: [
        {
          name: "mode",
          type: CustomCommandParamType.Enum,
          enumName: "addon:SortingMode",
        },
      ],
    },
    cmdSortContainer,
  );
}
