import { ActionFormData } from "@minecraft/server-ui";
import { setting } from "./config.js";
import { canUse } from "./validate.js";
import { hasUser, countUser } from "./state.js";
import { toggle } from "./toggle.js";

export function showMenu(player) {
  if (!canUse(player)) return;

  const isOn = hasUser(player.id);
  const current = countUser();
  const isFull = current >= setting.maxPeople;

  let btnText = isOn ? `§a${setting.text.on}` : `§c${setting.text.off}`;
  let btnIcon = isOn ? setting.icon.on : setting.icon.off;

  if (!isOn && isFull) {
    btnText = `§c${setting.text.full} (${current}/${setting.maxPeople})`;
    btnIcon = setting.icon.full;
  }

  const form = new ActionFormData();
  form.title("Magnet System");
  form.body(`§7Status: ${isOn ? "§aActive" : "§cInactive"}\n§7Player: ${current}/${setting.maxPeople}`);
  form.button(btnText, btnIcon);

  form.show(player).then((res) => {
    if (!res.canceled && res.selection === 0) {
      toggle(player, !isOn);
    }
  });
}
