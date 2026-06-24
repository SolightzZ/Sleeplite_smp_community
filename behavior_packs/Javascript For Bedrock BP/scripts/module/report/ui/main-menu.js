import { ActionFormData } from '@minecraft/server-ui';

import { addSound } from '../../../plugin/utils.js';
import { logError } from '../../../router/core/logger.js';
import { isAdmin } from '../utils/permission.js';
import { showForm } from '../utils/ui.js';
import { adminpanel } from './admin-panel.js';
import { note } from './patch-note-menu.js';
import { inbox, reportmenu } from './report-menu.js';

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
   }).catch((error) => logError('Report', 'System Error (Menu)', error));
};
