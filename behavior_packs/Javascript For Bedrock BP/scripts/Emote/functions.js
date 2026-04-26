import { ActionFormData } from "@minecraft/server-ui";
import { setting } from "./constants.js";
import { emoteList } from "./database.js";

function playEmote(player, animName, emoteName) {
  if (!player) return;

  try {
    const cmd = `playanimation @s animation.${animName} animation.${animName}`;
    player.runCommand(cmd);

    if (player.onScreenDisplay) {
      player.onScreenDisplay.setActionBar(`§aEmote: §f${emoteName}`);
    }

    if (setting.soundClick) {
      player.playSound(setting.soundClick);
    }
  } catch (err) {
    console.warn(`[Emote] Error: ${err}`);
  }
}

function stopEmote(player, animName) {
  if (!player) return;

  try {
    const cmd = `playanimation @s animation.${animName}`;
    player.runCommand(cmd);

    if (player.onScreenDisplay) {
      player.onScreenDisplay.setActionBar("§cEmote: §fSTOPPED");
    }

    if (setting.soundClick) {
      player.playSound(setting.soundClick);
    }
  } catch (err) {
    console.warn(`[Emote] Stop Error: ${err}`);
  }
}

function openSubMenu(player, group) {
  const menu = new ActionFormData().title(group.title || "Emotes").body("§7เลือกท่าทาง:");
  try {
    const items = group.items;
    for (const item of items) {
      menu.button(item.name, item.icon || setting.iconDefault);
    }

    menu.show(player).then((result) => {
      if (result.canceled || result.selection === undefined) return;

      const picked = items[result.selection];
      if (picked) {
        playEmote(player, picked.anim, picked.name);
      }
    });
  } catch (e) {
    console.warn("openSubMenu" + e);
  }
}

export function showMain(player) {
  const menu = new ActionFormData().title("§eEmote Menu");
  try {
    for (const group of emoteList) {
      menu.button(group.name, group.icon || setting.iconDefault);
    }

    if (setting.soundOpen) {
      player.playSound(setting.soundOpen);
    }

    menu.show(player).then((result) => {
      if (result.canceled || result.selection === undefined) return;

      const picked = emoteList[result.selection];

      if (picked.type === "BUTTON") {
        stopEmote(player, picked.cmd);
      } else if (picked.type === "GROUP") {
        openSubMenu(player, picked);
      }
    });
  } catch (e) {
    console.warn("openSubMenu" + e);
  }
}
