import { ActionFormData, MessageFormData } from "@minecraft/server-ui";
import { list } from "./constants.js";
import { load, save } from "./database.js";
import { time, name, give } from "./functions.js";

export function menu(player) {
  const today = time();
  const db = load(player);

  if (db.count >= list.length) {
    db.count = 0;
  }

  const form = new ActionFormData();
  form.title("Daily Reward");
  form.body(`Date: ${today}\nClaimed: ${db.count} Days`);

  for (let i = 0; i < list.length; i++) {
    const item = list[i];

    const isPast = i < db.count;
    const isTarget = i === db.count;
    const isClaimedToday = db.last === today;

    let txt = "";
    let icon = "";

    if (isPast) {
      txt = `Day ${item.day}: ${name(item.id)}`;
      icon = "textures/ui/worldsIcon.png";
    } else if (isTarget) {
      if (isClaimedToday) {
        txt = `Day ${item.day}: Come back tomorrow`;
        icon = "textures/ui/world_glyph_desaturated.png";
      } else {
        txt = `Day ${item.day}: ${name(item.id)} (Click!)`;
        icon = "textures/ui/csbChevronArrowLarge.png";
      }
    } else {
      txt = `§8Day ${item.day}: Locked`;
      icon = "textures/ui/world_glyph_desaturated.png";
    }

    form.button(txt, icon);
  }

  form.show(player).then((res) => {
    if (res.canceled) return;

    if (res.selection !== db.count) {
      player.sendMessage("§c[x] กรุณารับของตามลำดับ");
      return;
    }

    if (db.last === today) {
      player.sendMessage("§c[x] คุณรับของวันนี้ไปแล้ว");
      return;
    }

    confirm(player, db, today);
  });
}

function confirm(player, db, today) {
  const item = list[db.count];
  const bodyText = [
    `§7==========================`,
    ` §fPlayer: §e${player.name}`,
    ` §fDate: §e${today}`,
    `§7--------------------------`,
    ``,
    ` §fYou will receive:`,
    ` §6➤ ${name(item.id)} x${item.count}`,
    ``,
    `§7--------------------------`,
    `§8(Click Claim to accept)`,
  ].join("\n");
  const ui = new MessageFormData();
  ui.title("Confirm");
  ui.body(bodyText);
  ui.button1("Cancel");
  ui.button2("Claim");

  ui.show(player).then((res) => {
    if (res.selection === 1) {
      if (give(player, item.id, item.count)) {
        db.last = today;
        db.count = db.count + 1;

        save(player, db);
        player.sendMessage(`§a[/] §aรับของสำเร็จ! ได้รับ ${name(item.id)}`);
        player.playSound("random.levelup");
      } else {
        player.sendMessage("§c[x] §cช่องเก็บของเต็ม");
      }
    }
  });
}
