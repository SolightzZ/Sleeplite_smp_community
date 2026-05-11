import {
  CommandPermissionLevel,
  CustomCommandStatus,
  Player,
  system,
} from "@minecraft/server";

import { toggleZoom } from "./index.js";

export function ZoomCommand(init) {
  init.customCommandRegistry.registerCommand(
    {
      name: "addon:zoom",
      description: "Toggle zoom mode",
      permissionLevel: CommandPermissionLevel.Any,
      cheatsRequired: false,
    },

    ({ sourceEntity }) => {
      if (!(sourceEntity instanceof Player) || !sourceEntity.isValid) {
        return {
          status: CustomCommandStatus.Failure,
          message: "Player only.",
        };
      }

      system.run(() => {
        if (!sourceEntity.isValid) return;
        toggleZoom(sourceEntity);
      });

      return {
        status: CustomCommandStatus.Success,
      };
    },
  );
}
