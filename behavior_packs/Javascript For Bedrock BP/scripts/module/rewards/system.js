import {
  CommandPermissionLevel,
  CustomCommandStatus,
  system,
  world,
} from "@minecraft/server";
import { config } from "./constants.js";
import { load, reset } from "./database.js";
import { menu } from "./logic.js";

function RewarditemUse(event) {
  menu(event);
}

function RegisterRewards(init) {
  try {
    init.customCommandRegistry.registerCommand(
      {
        name: "addon:rw",
        description: "Rewards - รับรางวัลล็อกอิน",
        permissionLevel: CommandPermissionLevel.Any,
        cheatsRequired: false,
      },
      (origin) => {
        const player = origin.sourceEntity;

        if (!player || !player.isValid) {
          return {
            status: CustomCommandStatus.Failure,
            message: "§cThis command can only be used by players!",
          };
        }
        system.run(() => RewarditemUse(player));
        return {
          status: CustomCommandStatus.Success,
        };
      },
    );
  } catch (error) {
    console.error("[RegisterRewards] Failed to register commands: " + error);
  }
}

function RewardchatSend(event) {
  const p = event.sender;
  const msg = event.message;

  if (!p.hasTag(config.adminTag)) return;

  if (msg === "!reset-login") {
    event.cancel = true;
    reset(p);
    p.sendMessage("§e[Admin] Data Reset!");
  } else if (msg === "!check-reward") {
    event.cancel = true;
    let text = "=== Player Status ===\n";

    for (const target of world.getPlayers()) {
      const db = load(target);
      text += `§7${target.name}: Count=${db.count}, Last=${db.last || "Never"}\n`;
    }
    console.warn(text);
    p.sendMessage(text);
  }
}

export { RewarditemUse, RewardchatSend, RegisterRewards };
