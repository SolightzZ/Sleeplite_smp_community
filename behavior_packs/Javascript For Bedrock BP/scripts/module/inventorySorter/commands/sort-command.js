import {
  CommandPermissionLevel,
  CustomCommandParamType,
  CustomCommandStatus,
  system,
} from "@minecraft/server";
import { sortBlockContainer, sortPlayerInventory } from "../core/sorter.js";
import { SORTING_MODES } from "../config.js";

// Derive enum values from SORTING_MODES keys — single source of truth
const SORT_MODE_ENUM = Object.keys(SORTING_MODES);

const sortInventoryCommand = (origin, mode) => {
  const player = origin.sourceEntity;
  if (!player?.isValid) return { status: CustomCommandStatus.Failure };

  system.run(() => {
    if (!player.isValid) return;
    const res = sortPlayerInventory(player, mode);
    if (res.msg) player.sendMessage(res.msg);
  });

  return { status: CustomCommandStatus.Success };
};

const sortContainerCommand = (origin, mode) => {
  const player = origin.sourceEntity;
  if (!player?.isValid) return { status: CustomCommandStatus.Failure };

  system.run(() => {
    if (!player.isValid) return;
    const res = sortBlockContainer(player, mode);
    if (res.msg) player.sendMessage(res.msg);
  });

  return { status: CustomCommandStatus.Success };
};

export function registerCustomCommandIventory(init) {
  init.customCommandRegistry.registerEnum("addon:SortingMode", SORT_MODE_ENUM);

  init.customCommandRegistry.registerCommand(
    {
      name: "addon:r",
      description: "Sort player inventory — จัดเรียงไอเทมของผู้เล่น",
      permissionLevel: CommandPermissionLevel.Any,
      cheatsRequired: false,
      mandatoryParameters: [
        {
          name: "mode",
          type: CustomCommandParamType.Enum,
          enumName: "addon:SortingMode",
        },
      ],
    },
    sortInventoryCommand,
  );

  init.customCommandRegistry.registerCommand(
    {
      name: "addon:c",
      description: "Sort container inventory — จัดเรียงไอเทมในกล่อง",
      permissionLevel: CommandPermissionLevel.Any,
      cheatsRequired: false,
      mandatoryParameters: [
        {
          name: "mode",
          type: CustomCommandParamType.Enum,
          enumName: "addon:SortingMode",
        },
      ],
    },
    sortContainerCommand,
  );
}
