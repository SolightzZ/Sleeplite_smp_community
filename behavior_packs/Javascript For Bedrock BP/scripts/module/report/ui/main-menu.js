import { ActionFormData } from "@minecraft/server-ui";
import { isAdmin } from "../utils/permission.js";
import { note } from "./patch-note-menu.js";
import { reportmenu, inbox } from "./report-menu.js";
import { adminpanel } from "./admin-panel.js";

export const menu = (player) => {
  try {
    const ui = new ActionFormData();
    ui.title("เมนูหลัก (Main Menu)");
    ui.body("แจ้งปัญหาต่างได้ที่นี้เลย!!");

    ui.button("บันทึกการอัปเดต (Patch Note)");
    ui.button("แจ้งปัญหา (Report)");
    ui.button("กล่องตอบกลับ (Inbox)");

    if (isAdmin(player)) {
      ui.button("แผงควบคุม (Admin)");
    }

    ui.show(player).then((res) => {
      if (res.canceled) return;
      if (res.selection === 0) note(player);
      if (res.selection === 1) reportmenu(player);
      if (res.selection === 2) inbox(player);
      if (res.selection === 3 && isAdmin(player)) adminpanel(player);
    });
  } catch (e) {
    console.warn("[ Report ] System Error (Menu): " + e);
  }
};
