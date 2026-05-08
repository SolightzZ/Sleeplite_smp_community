import { ActionFormData, ModalFormData, MessageFormData } from "@minecraft/server-ui";
import { system } from "@minecraft/server";
import { CONFIG } from "../config.js";
import { Database } from "../core/database.js";
import { menu } from "./main-menu.js";
import { sure } from "../utils/ui.js";

export const sendform = (player) => {
  try {
    const name = player.name;
    const list = Database.get(name);

    if (list.length >= CONFIG.maxReports) {
      player.sendMessage(
        `§c[Report] กล่องข้อความเต็มแล้ว (${CONFIG.maxReports}/${CONFIG.maxReports})`,
      );
      reportmenu(player);
      return;
    }

    const ui = new ModalFormData();
    ui.title("แจ้งปัญหา / ข้อเสนอแนะ");
    ui.textField("หัวข้อเรื่อง", "เช่น: ฟาร์มบั๊ก, บล็อกหาย, ของหาย");
    ui.textField("รายละเอียด", "ระบุพิกัด และวิธีทำให้เกิดปัญหา");

    ui.show(player).then((res) => {
      try {
        if (res.canceled) {
          reportmenu(player);
          return;
        }
        const [t, b] = res.formValues;

        if (!t || !b || t.trim() === "" || b.trim() === "") {
          player.sendMessage("§c[Report] กรุณากรอกข้อมูลให้ครบถ้วน");
          system.runTimeout(() => {
          if (player.isValid) sendform(player);
        }, 20);
          return;
        }

        Database.add(name, t, b);
        player.sendMessage("§a[Report] บันทึกข้อมูลเรียบร้อยแล้ว");
        reportmenu(player);
      } catch (innerError) {
        console.warn("Logic Error (SendForm): " + innerError);
        player.sendMessage("§cเกิดข้อผิดพลาดในการบันทึกข้อมูล");
        reportmenu(player);
      }
    });
  } catch (e) {
    console.warn("System Error (SendForm): " + e);
    reportmenu(player);
  }
};

export const mylist = (player, mode) => {
  try {
    const name = player.name;
    const list = Database.get(name);

    if (list.length === 0) {
      player.sendMessage("§c[Report] ไม่พบข้อมูลในระบบ");
      reportmenu(player);
      return;
    }

    const ui = new ActionFormData();
    ui.title(mode === "edit" ? "เลือกรายการเพื่อแก้ไข" : "เลือกรายการเพื่อลบ");
    ui.body("รายการข้อความของท่าน");

    const listLen = list.length;
    for (let i = 0; i < listLen; i++) {
      ui.button(`${i + 1}. ${list[i].t}`);
    }

    ui.button("ย้อนกลับ", "textures/ui/arrow_left");

    ui.show(player).then((res) => {
      if (res.canceled) return;
      if (res.selection === list.length) {
        reportmenu(player);
        return;
      }

      const idx = res.selection;

      if (mode === "edit") {
        const f = new ModalFormData();
        f.title("แก้ไขรายงาน");
        f.textField("หัวข้อเรื่อง", "", { defaultValue: list[idx].t });
        f.textField("รายละเอียด", "", { defaultValue: list[idx].b });

        f.show(player).then((r) => {
          try {
            if (r.canceled) {
              mylist(player, mode);
              return;
            }
            const [nt, nb] = r.formValues;
            Database.update(name, idx, nt, nb);
            player.sendMessage("§e[Report] แก้ไขข้อมูลสำเร็จ");
            mylist(player, mode);
          } catch (e) {
            console.warn("Update Error: " + e);
            mylist(player, mode);
          }
        });
      } else {
        sure(
          player,
          () => {
            Database.delete(name, idx);
            player.sendMessage("§c[Report] ลบข้อมูลสำเร็จ");
            mylist(player, mode);
          },
          () => mylist(player, mode),
        );
      }
    });
  } catch (e) {
    console.warn("System Error (MyList): " + e);
    reportmenu(player);
  }
};

export const inbox = (player) => {
  try {
    const name = player.name;
    const list = Database.get(name);
    const replied = [];
    for (let i = 0; i < list.length; i++) {
      if (list[i].r !== "") replied.push(list[i]);
    }

    if (replied.length === 0) {
      const ui = new ActionFormData();
      ui.title("กล่องจดหมาย (Inbox)");
      ui.body("§7[Report] ยังไม่มีการตอบกลับจากผู้ดูแลระบบ");
      ui.button("ย้อนกลับ", "textures/ui/arrow_left");
      ui.show(player).then(() => menu(player));
      return;
    }

    const ui = new ActionFormData();
    ui.title("กล่องจดหมาย (Inbox)");
    ui.body("รายการที่ได้รับการตอบกลับแล้ว");

    const repliedLen = replied.length;
    for (let i = 0; i < repliedLen; i++) {
      ui.button(`อ่าน: ${replied[i].t}`);
    }

    ui.button("ย้อนกลับ", "textures/ui/arrow_left");

    ui.show(player).then((res) => {
      if (res.canceled) return;
      if (res.selection === replied.length) {
        menu(player);
        return;
      }

      const item = replied[res.selection];
      const show = new MessageFormData();
      show.title("รายละเอียดการตอบกลับ");
      show.body(`หัวข้อ: ${item.t}\nคำถาม: ${item.b}\n\n§eตอบกลับ: ${item.r}`);
      show.button1("ย้อนกลับ");
      show.button2("ปิดหน้าต่าง");

      show.show(player).then((r) => {
        if (r.selection === 0) inbox(player);
      });
    });
  } catch (e) {
    console.warn("System Error (Inbox): " + e);
    menu(player);
  }
};

export const reportmenu = (player) => {
  try {
    const ui = new ActionFormData();
    ui.title("เมนูรายงาน (Report)");
    ui.body("กรุณาเลือกรายการที่ต้องการ");

    ui.button("ส่งข้อความ");
    ui.button("แก้ไขข้อความ");
    ui.button("ลบข้อความ");
    ui.button("ย้อนกลับ", "textures/ui/arrow_left");

    ui.show(player).then((res) => {
      if (res.canceled) return;
      if (res.selection === 0) sendform(player);
      if (res.selection === 1) mylist(player, "edit");
      if (res.selection === 2) mylist(player, "del");
      if (res.selection === 3) menu(player);
    });
  } catch (e) {
    console.warn("System Error (ReportMenu): " + e);
    menu(player);
  }
};
