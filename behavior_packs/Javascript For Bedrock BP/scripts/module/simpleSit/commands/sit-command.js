import { CommandPermissionLevel, CustomCommandStatus, system } from "@minecraft/server";
import { handleSitCommand } from "../core/sit-handler";

export function registerCustomCommandTakeASeat(init) {
  init.customCommandRegistry.registerCommand(
    {
      name: "addon:sit",
      description: "Sit down anywhere you are standing (if conditions are met)",
      permissionLevel: CommandPermissionLevel.Any,
      mandatoryParameters: [],
      cheatsRequired: false,
    },
    (origin) => {
      const player = origin.sourceEntity;

      if (!player || player.typeId !== "minecraft:player") {
        return {
          status: CustomCommandStatus.Failure,
          message: "§cThis command can only be used by players!",
        };
      }

      system.run(() => handleSitCommand(player));
      return { status: CustomCommandStatus.Success };
    },
  );
}
