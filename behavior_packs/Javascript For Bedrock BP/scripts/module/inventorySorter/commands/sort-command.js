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
    if (res.msg) player.sendMessage(res.msg);
  });

  return { status: CustomCommandStatus.Success };
};

const cmdSortContainer = (origin, mode) => {
  const player = origin.sourceEntity;
  if (!player?.isValid) return { status: CustomCommandStatus.Failure };

  system.run(() => {
    if (!player.isValid) return;

    const res = sortBlockContainer(player, mode);
    if (res.msg) player.sendMessage(res.msg);
  });

  return { status: CustomCommandStatus.Success };
};

export function registerSortCommands(init) {
  init.customCommandRegistry.registerEnum("addon:SortingMode", MODE_ENUM);

  init.customCommandRegistry.registerCommand(
    {
      name: "addon:r",
      description: "Sort player inventory",
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
      description: "Sort container",
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
