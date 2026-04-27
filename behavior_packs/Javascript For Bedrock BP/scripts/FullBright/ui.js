import { ActionFormData } from "@minecraft/server-ui";
import { system } from "@minecraft/server";
import {
  title,
  onText,
  offText,
  onIcon,
  offIcon,
  msgOn,
  msgOff,
} from "./const.js";
import { hasBright, setBright } from "./state.js";

const UI_ON = new ActionFormData().title(title).button(onText, onIcon);
const UI_OFF = new ActionFormData().title(title).button(offText, offIcon);

const build = (on) => (on ? UI_ON : UI_OFF);

export const showMenu = (p) => {
  if (!p?.isValid()) return;
  const now = hasBright(p);

  system.run(() => {
    build(now)
      .show(p)
      .then((res) => {
        if (res.canceled || !p?.isValid()) return;

        const next = setBright(p, !now);
        if (next === undefined) return;

        const msg = next ? msgOn : msgOff;
        p.onScreenDisplay.setActionBar(msg(p.name));
      })
      .catch((error) => {
        console.log("showMenu error:", error.message);
      });
  });
};
