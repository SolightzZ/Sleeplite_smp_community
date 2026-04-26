import {
  system,
  CommandPermissionLevel,
  CustomCommandStatus,
  CustomCommandParamType,
} from "@minecraft/server";
import { sortPlayerInventory, sortBlockContainer } from "./logic.js";

function sortInventoryCommand(origin, mode) {
  const player = origin.sourceEntity;
  if (!player) {
    return { status: CustomCommandStatus.Failure };
  }
  system.run(() => {
    const res = sortPlayerInventory(player, mode);
    if (res?.msg) player.sendMessage(res.msg);
  });

  return { status: CustomCommandStatus.Success };
}

function sortContainerCommand(origin, mode) {
  const player = origin.sourceEntity;
  if (!player) {
    return { status: CustomCommandStatus.Failure };
  }
  system.run(() => {
    const res = sortBlockContainer(player, mode);
    if (res?.msg) player.sendMessage(res.msg);
  });

  return { status: CustomCommandStatus.Success };
}

system.beforeEvents.startup.subscribe(({ customCommandRegistry }) => {
  customCommandRegistry.registerEnum("addon:SortingMode", [
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

  customCommandRegistry.registerCommand(
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

  customCommandRegistry.registerCommand(
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
});

console.warn("Inventory Sorter loaded successfully");
