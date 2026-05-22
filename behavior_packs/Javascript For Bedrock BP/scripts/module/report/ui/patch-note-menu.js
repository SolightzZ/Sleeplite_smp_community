import { ActionFormData } from "@minecraft/server-ui";
import { patchNotesData } from "../data/patch-notes.js";
import { menu } from "./main-menu.js";
import { showForm } from "../utils/ui.js";

export const note = (player) => {
  try {
    const form = new ActionFormData();
    form.title("บันทึกการอัปเดตระบบ");

    let bodyText = "§6[ รายละเอียดระบบ ]§r\n§7รายการฟีเจอร์ ไอเทม และสิ่งก่อสร้างทั้งหมด\n\n";

    const sectionsLen = patchNotesData.length;
    for (let i = 0; i < sectionsLen; i++) {
      const section = patchNotesData[i];
      if (i > 0) bodyText += "\n\n";
      bodyText += `§3${section.category}§r\n§f- `;
      const itemsLen = section.items.length;
      for (let j = 0; j < itemsLen; j++) {
        if (j > 0) bodyText += "\n- ";
        bodyText += section.items[j];
      }
    }

    form.body(bodyText);
    form.button("ย้อนกลับ", "textures/ui/arrow_left");

    showForm(player, form, "note", (res) => {
      if (res.canceled) return;
      if (res.selection === 0) menu(player);
    });
  } catch (e) {
    console.warn("[ Report ] System Error (Note): " + e);
  }
};
