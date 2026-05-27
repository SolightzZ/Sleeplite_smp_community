import { ActionFormData } from "@minecraft/server-ui";
import { hasBright, toggleBright } from "./state.js";

export function showMenu(p) {
  if (!p || !p.isValid) return;

  const isOn = hasBright(p);

  const form = new ActionFormData();
  form.title("Full Bright");
  form.header(isOn ? `§aBright ON` : `§cBright OFF`);
  form.button(isOn ? "Turn Off" : "Turn On", isOn ? "textures/items/fullbright" : "textures/ui/icon_none");
  form.label("                 @Sleeplite SMP");

  form
    .show(p)
    .then((res) => {
      if (!res || res.canceled || res.selection !== 0) return;

      const next = toggleBright(p);

      if (p.isValid) {
        p.onScreenDisplay.setActionBar(next ? `§aBright ON §f(${p.name})` : `§cBright OFF §f(${p.name})`);
      }
    })
    .catch((e) => {
      if (e?.message !== "User is busy") {
        if (p.isValid) {
          p.sendMessage("§c[FullBright] เกิดข้อผิดพลาดในการเปิดเมนู");
        }
        console.error("[FullBright] UI Error:", e);
      }
    });
}
