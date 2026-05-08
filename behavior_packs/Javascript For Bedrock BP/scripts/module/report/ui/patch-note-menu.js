import { ActionFormData } from "@minecraft/server-ui";
import { patchNotesData } from "../data/patch-notes.js";
import { menu } from "./main-menu.js";

export const note = (player) => {
  try {
    const ui = new ActionFormData();
    ui.title("บันทึกการอัปเดตระบบ");

    let bodyText =
      "§6[ รายละเอียดระบบ ]§r\n§7รายการฟีเจอร์ ไอเทม และสิ่งก่อสร้างทั้งหมด\n\n";

    bodyText += patchNotesData
      .map(
        (section) =>
          `§3${section.category}§r\n§f- ${section.items.join("\n- ")}`,
      )
      .join("\n\n");

    ui.body(bodyText);
    ui.button("ย้อนกลับ", "textures/ui/arrow_left");

    ui.show(player).then((res) => {
      if (res.canceled) return;
      if (res.selection === 0) menu(player);
    });
  } catch (e) {
    console.warn("System Error (Note): " + e);
  }
};
