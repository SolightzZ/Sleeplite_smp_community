import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { Database } from "../core/database.js";
import { menu } from "./main-menu.js";
import { sure } from "../utils/ui.js";

export const adminact = (player, targetName, index) => {
  try {
    const list = Database.get(targetName);

    if (!list || !list[index]) {
      player.sendMessage("§c[Report] ข้อมูลถูกเปลี่ยนแปลงหรือลบแล้ว");
      adminmsg(player, targetName);
      return;
    }
    const item = list[index];
    const ui = new ActionFormData();

    ui.title("จัดการข้อความ");
    ui.body(`ผู้ส่ง: ${targetName}\nหัวข้อ: ${item.t}`);

    ui.button("อ่านรายละเอียด");
    ui.button("ตอบกลับ (Reply)");
    ui.button("ดู JSON (Console)");
    ui.button("ลบทิ้ง (Delete)");
    ui.button("ย้อนกลับ", "textures/ui/arrow_left");

    ui.show(player).then((res) => {
      if (res.canceled) return;

      if (res.selection === 0) {
        const f = new ModalFormData();
        f.title("รายละเอียดรายงาน");
        f.textField("ผู้ส่ง", "", { defaultValue: targetName });
        f.textField("เวลา", "", { defaultValue: item.d });
        f.textField("หัวข้อ", "", { defaultValue: item.t });
        f.textField("เนื้อหา", "", { defaultValue: item.b });
        if (item.r) f.textField("§aคำตอบเดิม", "", { defaultValue: item.r });
        f.show(player).then(() => adminact(player, targetName, index));
      } else if (res.selection === 1) {
        const f = new ModalFormData();
        f.title("ตอบกลับผู้ใช้งาน");
        f.textField("ข้อความตอบกลับ", "", { defaultValue: item.r });

        f.show(player).then((r) => {
          if (r.canceled) {
            adminact(player, targetName, index);
            return;
          }
          Database.reply(targetName, index, r.formValues[0]);
          player.sendMessage("§a[Report] บันทึกการตอบกลับสำเร็จ");
          adminact(player, targetName, index);
        });
      } else if (res.selection === 2) {
        console.warn(JSON.stringify(item, null, 2));
        adminact(player, targetName, index);
      } else if (res.selection === 3) {
        sure(
          player,
          () => {
            Database.delete(targetName, index);
            player.sendMessage("§c[Report] ลบข้อมูลสำเร็จ");
            adminmsg(player, targetName);
          },
          () => adminact(player, targetName, index),
        );
      } else {
        adminmsg(player, targetName);
      }
    });
  } catch (e) {
    console.warn("System Error (AdminAct): " + e);
    adminmsg(player, targetName);
  }
};

export const adminmsg = (player, targetName) => {
  try {
    const list = Database.get(targetName);
    if (!list || list.length === 0) {
      adminpanel(player);
      return;
    }

    const ui = new ActionFormData();
    ui.title(`ข้อความจาก ${targetName}`);

    const listLen = list.length;
    for (let i = 0; i < listLen; i++) {
      const item = list[i];
      const status = item.r ? "[ตอบแล้ว]" : "[รอ]";
      ui.button(`${status} ${item.t}`);
    }

    ui.button("ย้อนกลับ", "textures/ui/arrow_left");
    ui.show(player).then((res) => {
      if (res.canceled) return;
      if (res.selection === list.length) {
        adminpanel(player);
        return;
      }
      adminact(player, targetName, res.selection);
    });
  } catch (e) {
    console.warn("System Error (AdminMsg): " + e);
    adminpanel(player);
  }
};

export const adminpanel = (player) => {
  try {
    const db = Database.getAll();
    const names = Object.keys(db);

    const ui = new ActionFormData();
    ui.title("แผงควบคุมผู้ดูแล (Admin Panel)");
    ui.body(`มีผู้แจ้งปัญหาทั้งหมด ${names.length} คน`);

    ui.button("Dump (Console)");

    const namesLen = names.length;
    for (let i = 0; i < namesLen; i++) {
      const n = names[i];
      ui.button(`${n} (${db[n].length})`);
    }

    ui.button("ย้อนกลับ", "textures/ui/arrow_left");

    ui.show(player).then((res) => {
      if (res.canceled) return;

      if (res.selection === 0) {
        console.warn("***** Server Dump *****");
        console.warn(JSON.stringify(db, null, 2));
        player.sendMessage("§e[System] Dump ข้อมูลลง Console แล้ว");
        adminpanel(player);
      } else if (res.selection === names.length + 1) {
        menu(player);
      } else {
        const realIndex = res.selection - 1;
        if (realIndex >= 0) adminmsg(player, names[realIndex]);
      }
    });
  } catch (e) {
    console.warn("System Error (AdminPanel): " + e);
    menu(player);
  }
};
