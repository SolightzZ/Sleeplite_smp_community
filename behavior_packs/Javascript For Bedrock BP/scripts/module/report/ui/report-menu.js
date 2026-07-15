import { system } from '@minecraft/server';
import { ActionFormData, MessageFormData, ModalFormData } from '@minecraft/server-ui';

import { addSound } from '../../../plugin/utils.js';
import { logError } from '../../../events/logger.js';
import { CONFIG, LIMITS } from '../config.js';
import { Database } from '../core/database.js';
import { showForm, sure } from '../utils/ui.js';
import { showMenuReport } from './main-menu.js';
import { cache } from '../../../shared/cache.js';

const trimValues = (values) => {
   const result = [];
   for (const value of values) {
      result.push(typeof value === 'string' ? value.trim() : value);
   }
   return result;
};

const validateFields = (player, fields, limits) => {
   for (let i = 0; i < fields.length; i++) {
      if (!fields[i]) {
         cache.sendMessage(player, '§c[Report] กรุณากรอกข้อมูลให้ครบถ้วน');
         return false;
      }
      if (limits && fields[i].length > limits[i]) {
         cache.sendMessage(player, `§c[Report] ข้อความยาวเกิน ${limits[i]} ตัวอักษร`);
         return false;
      }
   }
   return true;
};

const sendform = (player) => {
   const name = player.name;
   const list = Database.get(name);

   if (list.length >= CONFIG.maxReports) {
      cache.sendMessage(player, `§c[Report] กล่องข้อความเต็มแล้ว (${CONFIG.maxReports}/${CONFIG.maxReports})`);
      reportmenu(player);
      return;
   }

   cache.playSound(player, 'item.book.page_turn');

   const ui = new ModalFormData();
   ui.title('แจ้งปัญหา / ข้อเสนอแนะ');
   ui.textField('หัวข้อเรื่อง', 'เช่น: ฟาร์มบั๊ก, บล็อกหาย, ของหาย');
   ui.textField('รายละเอียด', 'ระบุพิกัด และวิธีทำให้เกิดปัญหา');

   showForm(player, ui, 'sendform', (res) => {
      try {
         if (res.canceled) {
            reportmenu(player);
            return;
         }
         const [title, body] = trimValues(res.formValues);

         if (!validateFields(player, [title, body], [LIMITS.title, LIMITS.body])) {
            system.runTimeout(() => {
               if (pcheck(player)) sendform(player);
            }, 20);
            return;
         }

         Database.add(name, title, body);
         cache.sendMessage(player, '§a[Report] บันทึกข้อมูลเรียบร้อยแล้ว');
         reportmenu(player);
      } catch (innerError) {
         logError('Report', 'Logic Error (SendForm)', innerError);
         cache.sendMessage(player, '§cเกิดข้อผิดพลาดในการบันทึกข้อมูล');
         reportmenu(player);
      }
   }).catch((error) => {
      logError('Report', 'System Error (SendForm)', error);
      reportmenu(player);
   });
};

const editItem = (player, name, list, index) => {
   cache.playSound(player, 'item.book.page_turn');
   const form = new ModalFormData();
   form.title('แก้ไขรายงาน');
   form.textField('หัวข้อเรื่อง', '', { defaultValue: list[index].t });
   form.textField('รายละเอียด', '', { defaultValue: list[index].b });

   showForm(player, form, 'mylist.edit', (result) => {
      try {
         if (result.canceled) {
            mylist(player, 'edit');
            return;
         }
         const [newTitle, newBody] = trimValues(result.formValues);
         if (!validateFields(player, [newTitle, newBody], [LIMITS.title, LIMITS.body])) {
            mylist(player, 'edit');
            return;
         }
         Database.update(name, index, newTitle, newBody);
         cache.sendMessage(player, '§e[Report] แก้ไขข้อมูลสำเร็จ');
         mylist(player, 'edit');
      } catch (error) {
         logError('Report', 'Update Error', error);
         mylist(player, 'edit');
      }
   });
};

const deleteItem = (player, name, index) => {
   sure(
      player,
      () => {
         Database.delete(name, index);
         cache.sendMessage(player, '§c[Report] ลบข้อมูลสำเร็จ');
         mylist(player, 'del');
      },
      () => mylist(player, 'del'),
   );
};

const mylist = (player, mode) => {
   cache.playSound(player, 'item.book.page_turn');
   const name = player.name;
   const list = Database.get(name);

   if (list.length === 0) {
      cache.sendMessage(player, '§c[Report] ไม่พบข้อมูลในระบบ');
      reportmenu(player);
      return;
   }

   const ui = new ActionFormData();
   ui.title(mode === 'edit' ? 'เลือกรายการเพื่อแก้ไข' : 'เลือกรายการเพื่อลบ');
   ui.body('รายการข้อความของท่าน');

   const listLen = list.length;
   for (let i = 0; i < listLen; i++) {
      ui.button(`${i + 1}. ${list[i].t}`);
   }

   ui.button('ย้อนกลับ', 'textures/ui/arrow_left');

   showForm(player, ui, 'mylist', (res) => {
      if (res.canceled) return;
      if (res.selection === list.length) {
         reportmenu(player);
         return;
      }

      const index = res.selection;

      if (mode === 'edit') {
         editItem(player, name, list, index);
      } else {
         deleteItem(player, name, index);
      }
   }).catch((error) => {
      logError('Report', 'System Error (MyList)', error);
      reportmenu(player);
   });
};

export const inbox = (player) => {
   cache.playSound(player, 'item.book.page_turn');
   const name = player.name;
   const list = Database.get(name);
   const replied = list.filter((item) => item.r !== '');

   if (replied.length === 0) {
      const ui = new ActionFormData();
      ui.title('กล่องจดหมาย (Inbox)');
      ui.body('§7[Report] ยังไม่มีการตอบกลับจากผู้ดูแลระบบ');
      ui.button('ย้อนกลับ', 'textures/ui/arrow_left');
      showForm(player, ui, 'inbox.empty', () => showMenuReport(player));
      return;
   }

   const ui = new ActionFormData();
   ui.title('กล่องจดหมาย (Inbox)');
   ui.body('รายการที่ได้รับการตอบกลับแล้ว');

   const repliedLen = replied.length;
   for (let i = 0; i < repliedLen; i++) {
      ui.button(`อ่าน: ${replied[i].t}`);
   }

   ui.button('ย้อนกลับ', 'textures/ui/arrow_left');

   showForm(player, ui, 'inbox', (res) => {
      if (res.canceled) return;
      if (res.selection === replied.length) {
         showMenuReport(player);
         return;
      }

      const item = replied[res.selection];
      cache.playSound(player, 'item.book.page_turn');
      const show = new MessageFormData();
      show.title('รายละเอียดการตอบกลับ');
      show.body(`หัวข้อ: ${item.t}\nคำถาม: ${item.b}\n\n§eตอบกลับ: ${item.r}`);
      show.button1('ย้อนกลับ');
      show.button2('ปิดหน้าต่าง');

      showForm(player, show, 'inbox.detail', (result) => {
         if (result.selection === 0) inbox(player);
      });
   }).catch((error) => {
      logError('Report', 'System Error (Inbox)', error);
      showMenuReport(player);
   });
};

export const reportmenu = (player) => {
   cache.playSound(player, 'item.book.page_turn');
   const ui = new ActionFormData();
   ui.title('เมนูรายงาน (Report)');
   ui.body('กรุณาเลือกรายการที่ต้องการ');

   ui.button('ส่งข้อความ');
   ui.button('แก้ไขข้อความ');
   ui.button('ลบข้อความ');
   ui.button('ย้อนกลับ', 'textures/ui/arrow_left');

   showForm(player, ui, 'reportmenu', (res) => {
      if (res.canceled) return;
      if (res.selection === 0) sendform(player);
      if (res.selection === 1) mylist(player, 'edit');
      if (res.selection === 2) mylist(player, 'del');
      if (res.selection === 3) showMenuReport(player);
   }).catch((error) => {
      logError('Report', 'System Error (ReportMenu)', error);
      showMenuReport(player);
   });
};
