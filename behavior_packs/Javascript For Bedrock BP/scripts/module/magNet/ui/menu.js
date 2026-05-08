import { ActionFormData } from "@minecraft/server-ui";
import { setting } from "../config.js";
import { countUser, hasUser } from "../core/state.js";
import { canUse, toggle } from "../core/toggle.js";

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

  const form = new ActionFormData()
    .title("Magnet System")
    .body(`§7Status: ${isOn ? "§aActive" : "§cInactive"}`)
    .label(`§7Player: ${current}/${setting.maxPeople}`)
    .button(btnText, btnIcon)
    .label("                 @Sleeplite SMP");

  form
    .show(player)
    .then((res) => {
      if (!res || res.canceled || res.selection !== 0) return;
      if (!player.isValid) return;
      toggle(player, !isOn);
    })
    .catch((error) => {
      if (error.message !== "User is busy") {
        console.error("[Magnet] UI Error:", error);
      }
    });
}
