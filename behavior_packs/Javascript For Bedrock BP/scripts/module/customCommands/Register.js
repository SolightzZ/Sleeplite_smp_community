import {
  CommandPermissionLevel,
  CustomCommandStatus,
  system,
} from "@minecraft/server";
import { showServerMenu } from "./Transfer.js";

const quickServersCommand = (origin) => {
  const player = origin.sourceEntity;

  if (!player || player.typeId !== "minecraft:player" || !player.isValid) {
    return { status: CustomCommandStatus.Failure };
  }

  system.run(() => {
    if (player.isValid) showServerMenu(player);
  });

  return { status: CustomCommandStatus.Success };
};

export function registerCommands(init) {
  init.customCommandRegistry.registerCommand(
    {
      name: "addon:server",
      description: "§7Quick Server - เข้าร่วมเซิร์ฟเวอร์อื่นๆ",
      permissionLevel: CommandPermissionLevel.Any,
    },
    quickServersCommand
  );
}
