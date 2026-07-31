import { ActionFormData } from '@minecraft/server-ui';
import { logError } from '../../../events/logger.js';
import { cache } from '../../../shared/cache.js';
import { patchNotesData } from '../data/patch-notes.js';
import { showForm } from '../utils/ui.js';
import { showMenuReport } from './main-menu.js';

export const note = (player) => {
   const form = new ActionFormData();
   form.title('บันทึกการอัปเดตระบบ');

   cache.playSound(player, 'item.book.page_turn');

   let bodyText = '§6[ รายละเอียดระบบ ]§r\n§7รายการฟีเจอร์ ไอเทม และสิ่งก่อสร้างทั้งหมด\n\n';

   patchNotesData.forEach((section, sectionIndex) => {
      if (sectionIndex > 0) bodyText += '\n\n';
      bodyText += `§3${section.category}§r\n§f- `;
      section.items.forEach((item, itemIndex) => {
         if (itemIndex > 0) bodyText += '\n- ';
         bodyText += item;
      });
   });

   form.body(bodyText);
   form.button('ย้อนกลับ', 'textures/ui/arrow_left');

   showForm(player, form, 'note', (res) => {
      if (res.canceled) return;
      if (res.selection === 0) {
         showMenuReport(player);
      }
   }).catch((error) => logError('Report', 'System Error (Note)', error));
};
