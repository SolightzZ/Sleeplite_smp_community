import { ActionFormData, ModalFormData } from '@minecraft/server-ui';
import { logError, logWarn } from '../../../events/logger.js';
import { cache } from '../../../shared/cache.js';
import { LIMITS } from '../config.js';
import { ReportDatabase } from '../core/database.js';
import { showForm, sure } from '../utils/ui.js';
import { showMenuReport } from './main-menu.js';

const showDetail = (player, item, targetName, index) => {
   cache.playSound(player, 'item.book.page_turn');
   const form = new ModalFormData();
   form.title('รายละเอียดรายงาน');
   form.textField('ผู้ส่ง', '', { defaultValue: targetName });
   form.textField('เวลา', '', { defaultValue: item.d });
   form.textField('หัวข้อ', '', { defaultValue: item.t });
   form.textField('เนื้อหา', '', { defaultValue: item.b });
   if (item.r) form.textField('§aคำตอบเดิม', '', { defaultValue: item.r });
   showForm(player, form, 'adminact.detail', () => adminact(player, targetName, index));
};

const showReplyForm = (player, item, targetName, index) => {
   cache.playSound(player, 'item.book.page_turn');
   const form = new ModalFormData();
   form.title('ตอบกลับผู้ใช้งาน');
   form.textField('ข้อความตอบกลับ', '', { defaultValue: item.r });

   showForm(player, form, 'adminact.reply', (result) => {
      if (result.canceled) {
         adminact(player, targetName, index);
         return;
      }
      const text = result.formValues[0];
      if (!text || text.trim() === '') {
         cache.sendMessage(player, '§c[Report] กรุณากรอกข้อความตอบกลับ');
         adminact(player, targetName, index);
         return;
      }
      const trimmed = text.trim();
      if (trimmed.length > LIMITS.reply) {
         cache.sendMessage(player, `§c[Report] ข้อความยาวเกิน ${LIMITS.reply} ตัวอักษร`);
         adminact(player, targetName, index);
         return;
      }
      ReportDatabase.reply(targetName, index, trimmed);
      cache.sendMessage(player, '§a[Report] บันทึกการตอบกลับสำเร็จ');
      adminact(player, targetName, index);
   });
};

const dumpToConsole = (player, item, targetName, index) => {
   logWarn('Debug', JSON.stringify(item, null, 2));
   adminact(player, targetName, index);
};

const confirmDelete = (player, targetName, index) => {
   sure(
      player,
      () => {
         ReportDatabase.delete(targetName, index);
         cache.sendMessage(player, '§c[Report] ลบข้อมูลสำเร็จ');
         adminmsg(player, targetName);
      },
      () => adminact(player, targetName, index),
   );
};

const adminact = (player, targetName, index) => {
   try {
      cache.playSound(player, 'item.book.page_turn');
      const list = ReportDatabase.get(targetName);

      if (!list || !list[index]) {
         cache.sendMessage(player, '§c[Report] ข้อมูลถูกเปลี่ยนแปลงหรือลบแล้ว');
         adminmsg(player, targetName);
         return;
      }
      const item = list[index];
      const ui = new ActionFormData();

      ui.title('จัดการข้อความ');
      ui.body(`ผู้ส่ง: ${targetName}\nหัวข้อ: ${item.t}`);

      ui.button('อ่านรายละเอียด');
      ui.button('ตอบกลับ (Reply)');
      ui.button('ดู JSON (Console)');
      ui.button('ลบทิ้ง (Delete)');
      ui.button('ย้อนกลับ', 'textures/ui/arrow_left');

      showForm(player, ui, 'adminact', (res) => {
         if (res.canceled) return;

         switch (res.selection) {
            case 0:
               showDetail(player, item, targetName, index);
               break;
            case 1:
               showReplyForm(player, item, targetName, index);
               break;
            case 2:
               dumpToConsole(player, item, targetName, index);
               break;
            case 3:
               confirmDelete(player, targetName, index);
               break;
            default:
               adminmsg(player, targetName);
         }
      });
   } catch (error) {
      logError('Report', 'System Error (AdminAct)', error);
      adminmsg(player, targetName);
   }
};

const adminmsg = (player, targetName) => {
   try {
      cache.playSound(player, 'item.book.page_turn');
      const list = ReportDatabase.get(targetName);
      if (!list || list.length === 0) {
         adminpanel(player);
         return;
      }

      const ui = new ActionFormData();
      ui.title(`ข้อความจาก ${targetName}`);

      const listLen = list.length;
      for (let i = 0; i < listLen; i++) {
         const item = list[i];
         const status = item.r ? '[ตอบแล้ว]' : '[รอ]';
         ui.button(`${status} ${item.t}`);
      }

      ui.button('ย้อนกลับ', 'textures/ui/arrow_left');
      showForm(player, ui, 'adminmsg', (res) => {
         if (res.canceled) return;
         if (res.selection === list.length) {
            adminpanel(player);
            return;
         }
         adminact(player, targetName, res.selection);
      });
   } catch (error) {
      logError('Report', 'System Error (AdminMsg)', error);
      adminpanel(player);
   }
};

export const adminpanel = (player) => {
   try {
      cache.playSound(player, 'item.book.page_turn');
      const db = ReportDatabase.getAll();
      const names = Object.keys(db);

      const ui = new ActionFormData();
      ui.title('แผงควบคุมผู้ดูแล (Admin Panel)');
      ui.body(`มีผู้แจ้งปัญหาทั้งหมด ${names.length} คน`);

      ui.button('Dump (Console)');

      const namesLen = names.length;
      for (let i = 0; i < namesLen; i++) {
         const playerName = names[i];
         ui.button(`${playerName} (${db[playerName].length})`);
      }

      ui.button('ย้อนกลับ', 'textures/ui/arrow_left');

      showForm(player, ui, 'adminpanel', (res) => {
         if (res.canceled) return;

         if (res.selection === 0) {
            logWarn('Debug', '***** Server Dump *****');
            logWarn('Debug', JSON.stringify(db, null, 2));
            cache.sendMessage(player, '§e[System] Dump ข้อมูลลง Console แล้ว');
            adminpanel(player);
         } else if (res.selection === names.length + 1) {
            showMenuReport(player);
         } else {
            const realIndex = res.selection - 1;
            if (realIndex >= 0) adminmsg(player, names[realIndex]);
         }
      });
   } catch (error) {
      logError('Report', 'System Error (AdminPanel)', error);
      showMenuReport(player);
   }
};
