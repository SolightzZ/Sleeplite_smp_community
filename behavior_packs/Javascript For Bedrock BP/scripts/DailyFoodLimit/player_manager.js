import { world } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { foods, rules, colors } from "./constants";
import * as State from "./state";
import * as Utils from "./utils";

function admins(player) {
  return player.hasTag("admin");
}

function getText(player) {
  let text = "";
  for (const food of foods) {
    const count = State.getcount(player, food);
    if (count > 0) {
      text += `${colors.gray}${Utils.fixname(food)} ${colors.white}${count}/${rules.max}\n`;
    }
  }
  return text !== "" ? text.trimEnd() : "No food eaten today";
}

function GuiPlayers(player) {
  const players = world.getPlayers();
  const admin = admins(player);
  const ui = new ActionFormData();
  ui.title("Players");
  ui.body("[?] เลือกผู้เล่น");
  for (const p of players) {
    ui.button(p.name + (admins(p) ? " (admin)" : ""));
  }
  ui.show(player).then((res) => {
    if (res.canceled) return;
    const target = players[res.selection];
    if (!target) return;
    if (!admin) {
      showFood(player, target);
      return;
    }
    PlayerMenu(player, target);
  });
}

function PlayerMenu(player, target) {
  const ui = new ActionFormData().title(target.name).body("[?] เลือกการใช้งาน").button("View").button("Reset").button("Back");
  ui.show(player).then((res) => {
    if (res.canceled) return;
    if (res.selection === 0) {
      showFood(player, target);
      return;
    }
    if (res.selection === 1) {
      Resets(player, target);
      return;
    }
    GuiPlayers(player);
  });
}

function showFood(player, target) {
  const admin = admins(player);
  const ui = new ActionFormData().title(`Food: ${target.name}`).body(getText(target)).button("Back");
  ui.show(player).then((res) => {
    if (res.canceled) return;
    admin ? PlayerMenu(player, target) : GuiPlayers(player);
  });
}

function Resets(admin, target) {
  if (!admins(admin)) return;
  const ui = new ModalFormData()
    .title("Reset Food Data")
    .toggle(`Reset food data for ${target.name}`, { defaultValue: false })
    .submitButton("Confirm");
  ui.show(admin).then((res) => {
    if (res.canceled) return;
    if (!res.formValues?.[0]) {
      admin.sendMessage(`${colors.red}[x] Cancelled`);
      PlayerMenu(admin, target);
      return;
    }
    State.clear(target);
    admin.sendMessage(`${colors.green}[/] Food data reset for ${target.name}`);

    PlayerMenu(admin, target);
  });
}

export function OpenGuiPlayers({ source }) {
  GuiPlayers(source);
}
