import { CommandPermissionLevel, CustomCommandStatus, system } from "@minecraft/server";
import { startCinematicNow } from "../core/afk-manager";

const quickCommandAFK = (origin) => {
  const player = origin.sourceEntity;
  if (!player || !player.isValid) return { status: CustomCommandStatus.Failure };
  system.run(() => startCinematicNow(player));
  return { status: CustomCommandStatus.Success };
};

export function registerCommandAFK(init) {
  try {
    init.customCommandRegistry.registerCommand(
      {
        name: "addon:afk",
        description: "Enter AFK Cinematic mode immediately.",
        permissionLevel: CommandPermissionLevel.Any,
        cheatsRequired: false,
      },
      quickCommandAFK,
    );
  } catch { }
}
