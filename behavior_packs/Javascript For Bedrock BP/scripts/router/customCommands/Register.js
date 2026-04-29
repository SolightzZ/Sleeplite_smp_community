import {
  system,
  CommandPermissionLevel,
  CustomCommandStatus,
} from "@minecraft/server";
import { showServerMenu } from "./functions.js";

const quickServersCommand = (origin) => {
  const player = origin.sourceEntity;

  if (!player || !player.isValid) {
    return { status: CustomCommandStatus.Failure };
  }

  system.run(() => {
    showServerMenu(player);
  });

  return { status: CustomCommandStatus.Success };
};

function registerCommands(init) {
  const commandData = {
    name: "addon:server",
    description: "§7Quick Server - เข้าร่วมเซิร์ฟเวอร์อื่นๆ",
    permissionLevel: CommandPermissionLevel.Any,
  };

  init.customCommandRegistry.registerCommand(commandData, quickServersCommand);
}

export { registerCommands };
