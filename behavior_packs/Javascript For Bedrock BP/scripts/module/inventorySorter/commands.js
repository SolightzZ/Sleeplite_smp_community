import {
  CommandPermissionLevel,
  CustomCommandParamType,
  CustomCommandStatus,
  system,
} from "@minecraft/server";
import { sortBlockContainer, sortPlayerInventory } from "./logic.js";

const sortInventoryCommand = (origin, mode) => {
  const player = origin.sourceEntity;
  if (!player) {
    return { status: CustomCommandStatus.Failure };
  }
  system.run(() => {
    const res = sortPlayerInventory(player, mode);
    if (res?.msg) player.sendMessage(res.msg);
  });

  return { status: CustomCommandStatus.Success };
};

const sortContainerCommand = (origin, mode) => {
  const player = origin.sourceEntity;
  if (!player) {
    return { status: CustomCommandStatus.Failure };
  }
  system.run(() => {
    const res = sortBlockContainer(player, mode);
    if (res?.msg) player.sendMessage(res.msg);
  });
  return { status: CustomCommandStatus.Success };
};

function registerCustomCommandIventory(init) {
  init.customCommandRegistry.registerEnum("addon:SortingMode", [
    "type",
    "low",
    "max",
    "rarity",
    "stack",
    "tool",
    "name",
    "durability",
    "chess",
    "line",
    "column",
  ]);

  init.customCommandRegistry.registerCommand(
    {
      name: "addon:r",
      description: "Sort player inventory - จัดเรียงไอเทมของผู้เล่น",
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
      description: "Sort container inventory - จัดเรียงไอเทมในกล่อง",
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

export { registerCustomCommandIventory };
