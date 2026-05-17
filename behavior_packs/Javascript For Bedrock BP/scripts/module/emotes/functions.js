import { system } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { emoteList, setting } from "./database.js";

function playEmote(player, animName, emoteName) {
  if (!player.isValid) return;

  const cmd = `playanimation @s animation.${animName} animation.${animName}`;
  player.runCommand(cmd);

  player.onScreenDisplay?.setActionBar(`§aEmote: §f${emoteName}`);
  if (setting.soundClick) player.playSound(setting.soundClick);
}

function stopEmote(player, animName) {
  if (!player.isValid) return;

  const cmd = `playanimation @s animation.${animName}`;
  player.runCommand(cmd);

  player.onScreenDisplay?.setActionBar("§cEmote: §fSTOPPED");
  if (setting.soundClick) player.playSound(setting.soundClick);
}

function openSubMenu(player, group) {
  if (!player.isValid) return;

  const form = new ActionFormData().title("§e§m§o§t§e§f" + "§r§8" + group.title || "Emotes").body("§7เลือกท่าทาง:");

  const items = group.items;
  const len = items.length;

  for (let i = 0; i < len; i++) {
    const item = items[i];
    form.button(item.name, item.icon || setting.iconDefault);
  }

  form
    .show(player)
    .then((result) => {
      if (!result || result.canceled) return;

      const idx = result.selection;
      if (idx === undefined) return;

      const picked = items[idx];
      if (picked) {
        system.run(() => {
          if (player.isValid) playEmote(player, picked.anim, picked.name);
        });
      }
    })
    .catch((error) => {
      if (error?.message !== "User is busy") {
        if (player.isValid) {
          player.sendMessage("§c[Emote] เกิดข้อผิดพลาด");
        }
        console.error("[Emote] OpenSubMenu UI Error:", error);
      }
    });
}

export function showMain(player) {
  if (!player.isValid) return;

  const form = new ActionFormData().title("Emote Menu");
  form.body("§7เลือกท่าทาง:");
  const len = emoteList.length;
  for (let i = 0; i < len; i++) {
    const group = emoteList[i];
    form.button(group.name, group.icon || setting.iconDefault);
  }

  form.label("                 @Sleeplite SMP");

  if (setting.soundOpen) {
    player.playSound(setting.soundOpen);
  }

  form
    .show(player)
    .then((result) => {
      if (!result || result.canceled) return;

      const idx = result.selection;
      if (idx === undefined) return;

      const picked = emoteList[idx];
      if (!picked) return;

      system.run(() => {
        if (!player.isValid) return;
        if (picked.type === "BUTTON") {
          stopEmote(player, picked.cmd);
        } else if (picked.type === "GROUP") {
          openSubMenu(player, picked);
        }
      });
    })
    .catch((error) => {
      if (error?.message !== "User is busy") {
        if (player.isValid) {
          player.sendMessage("§c[Emote] เกิดข้อผิดพลาด");
        }
        console.error("[Emote] ShowMain UI Error:", error);
      }
    });
}
