import { system, CommandPermissionLevel, CustomCommandStatus } from "@minecraft/server";
import { showServerMenu } from "./functions.js";

function showServerSelection(event) {
  const player = event.player;
  system.run(() => showServerMenu(player));
}

function quickServersCommand(origin) {
  const player = origin.sourceEntity;
  if (!player) return { status: CustomCommandStatus.Failure };

  system.run(() => showServerSelection({ player }));
  return { status: CustomCommandStatus.Success };
}

system.beforeEvents.startup.subscribe((init) => {
  const addonServers = {
    name: "addon:server",
    description: "§7Quick Server - เข้าร่วมเซิร์ฟเวอร์อื่นๆ",
    permissionLevel: CommandPermissionLevel.Any,
  };
  init.customCommandRegistry.registerCommand(addonServers, quickServersCommand);
});

console.warn("Custom Command Registry loaded successfully");
