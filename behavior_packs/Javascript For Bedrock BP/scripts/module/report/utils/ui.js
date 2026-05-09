import { MessageFormData } from "@minecraft/server-ui";

export const sure = (player, onConfirm, onCancel) => {
  try {
    const ui = new MessageFormData();
    ui.title("ยืนยันการลบข้อมูล");
    ui.body("ท่านแน่ใจหรือไม่ที่จะลบรายการนี้? การกระทำนี้ไม่สามารถยกเลิกได้");
    ui.button1("Confirm (ยืนยัน)");
    ui.button2("Cancel (ยกเลิก)");

    ui.show(player).then((res) => {
      if (res.canceled) {
        if (onCancel) onCancel();
        return;
      }
      if (res.selection === 0) onConfirm();
      else if (onCancel) onCancel();
    });
  } catch (e) {
    console.warn("[ Report ] System Error (Sure): " + e);
  }
};
