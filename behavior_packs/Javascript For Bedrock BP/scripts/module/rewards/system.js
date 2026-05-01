import { world } from "@minecraft/server";
import { config } from "./constants.js";
import { load, reset } from "./database.js";
import { menu } from "./logic.js";

export function RewarditemUse({ source }) {
  menu(source);
}

export function RewardchatSend(event) {
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
