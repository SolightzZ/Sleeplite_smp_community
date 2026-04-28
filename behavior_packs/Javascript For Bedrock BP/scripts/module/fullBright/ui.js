import { ActionFormData } from "@minecraft/server-ui";
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

const build = (on) =>
  new ActionFormData()
    .title(title)
    .button(on ? onText : offText, on ? onIcon : offIcon);

export const showMenu = (p) => {
  const now = hasBright(p);

  build(now)
    .show(p)
    .then((res) => {
      if (res.canceled) return;

      const next = setBright(p, !now);
      if (next === undefined) return;

      const msg = next ? msgOn : msgOff;
      p.onScreenDisplay.setActionBar(msg(p.name));
    });
};
