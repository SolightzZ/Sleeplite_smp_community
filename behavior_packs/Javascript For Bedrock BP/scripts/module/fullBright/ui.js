import { ActionFormData } from "@minecraft/server-ui";
import { hasBright, toggleBright } from "./state.js";

export function showMenu(p) {
  if (!p || !p.isValid) return;

  const isOn = hasBright(p);

  const form = new ActionFormData()
    .title("Full Bright")
    .header(isOn ? `§aBright ON` : `§cBright OFF`)
    .button(
      isOn ? "Turn Off" : "Turn On",
      isOn ? "textures/items/fullbright" : "textures/ui/icon_none",
    )
    .label("                 @Sleeplite SMP");

  form
    .show(p)
    .then((res) => {
      if (!res || res.canceled || res.selection !== 0) return;

      const next = toggleBright(p);

      if (p.isValid) {
        p.onScreenDisplay.setActionBar(
          next ? `§aBright ON §f(${p.name})` : `§cBright OFF §f(${p.name})`,
        );
      }
    })
    .catch((error) => {
      if (error.message !== "User is busy") {
        console.error("[FullBright] UI Error:", error);
      }
    });
}
