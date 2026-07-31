import { CommandPermissionLevel, CustomCommandStatus, system } from "@minecraft/server";
import { toggleZoom } from "./core.js";
import { pisPlayer, pcheck } from "./../../shared/player.js";

export function ZoomCommand(init) {
  init.customCommandRegistry.registerCommand(
    {
      name: "addon:zoom",
      description: "Toggle zoom mode",
      permissionLevel: CommandPermissionLevel.Any,
      cheatsRequired: false,
    },

    ({ sourceEntity }) => {
      if (!pisPlayer(sourceEntity)) {
        return {
          status: CustomCommandStatus.Failure,
          message: "Player only.",
        };
      }

      system.run(() => {
        if (!pcheck(sourceEntity)) return;
        toggleZoom(sourceEntity);
      });

      return {
        status: CustomCommandStatus.Success,
      };
    },
  );
}
