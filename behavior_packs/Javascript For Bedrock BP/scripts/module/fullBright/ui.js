import { ActionFormData } from "@minecraft/server-ui";
import { hasBright, toggleBright } from "./state.js";

function showMenu(p) {
  const isOn = hasBright(p);

  const form = new ActionFormData()
    .title("Full Bright")
    .button(
      isOn ? "Turn Off" : "Turn On",
      isOn ? "textures/items/full2" : "textures/items/full",
    );

  form.show(p).then((res) => {
    if (res.canceled) return;

    const next = toggleBright(p);

    p.onScreenDisplay.setActionBar(
      next ? `§aBright ON §f(${p.name})` : `§cBright OFF §f(${p.name})`,
    );
  });
}

export { showMenu };
