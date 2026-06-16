import { ActionFormData } from '@minecraft/server-ui';
import { isAdmin } from '../utils/permission.js';
import { note } from './patch-note-menu.js';
import { reportmenu, inbox } from './report-menu.js';
import { adminpanel } from './admin-panel.js';
import { showForm } from '../utils/ui.js';
import { addSound } from '../../../plugin/utils.js';

export const showMenuReport = (arg) => {
   const player = arg?.source ?? arg;

   if (!player || !player.isValid) return;

   addSound(player, 'item.book.page_turn');

   const form = new ActionFormData();
   form.title('Report | แจ้งปัญหา');
   form.body('แจ้งปัญหาต่างได้ที่นี้เลย!!');
   form.button('บันทึกการอัปเดต (Patch Note)');
   form.button('แจ้งปัญหา (Report)');
   form.button('กล่องตอบกลับ (Inbox)');

   if (isAdmin(player)) {
      form.button('แผงควบคุม (Admin)');
   }

   showForm(player, form, 'menu', (res) => {
      if (res.canceled) return;
      if (res.selection === 0) note(player);
      if (res.selection === 1) reportmenu(player);
      if (res.selection === 2) inbox(player);
      if (res.selection === 3 && isAdmin(player)) adminpanel(player);
   }).catch((error) => console.error('[ Report ] System Error (Menu): ' + error));
};
