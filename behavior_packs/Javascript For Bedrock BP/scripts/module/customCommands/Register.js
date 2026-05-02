import {
  CommandPermissionLevel,
  CustomCommandStatus,
  system,
} from "@minecraft/server";
import { showServerMenu } from "./Transfer";

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
  try {
    const commandData = {
      name: "addon:server",
      description: "§7Quick Server - เข้าร่วมเซิร์ฟเวอร์อื่นๆ",
      permissionLevel: CommandPermissionLevel.Any,
    };

    init.customCommandRegistry.registerCommand(
      commandData,
      quickServersCommand,
    );
  } catch (error) {
    console.error("[Startup] Failed to register commands: " + error);
  }
}

export { registerCommands };
