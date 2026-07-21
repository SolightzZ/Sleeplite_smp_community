import { ActionFormData } from '@minecraft/server-ui';
import { logError } from '../../../events/logger.js';
import { cache } from '../../../shared/cache.js';
import { isAdmin } from '../utils/permission.js';
import { showForm } from '../utils/ui.js';
import { pcheck } from './../../../shared/player.js';
import { adminpanel } from './admin-panel.js';
import { note } from './patch-note-menu.js';
import { inbox, reportmenu } from './report-menu.js';

export const showMenuReport = (arg) => {
   const player = arg?.source ?? arg;

   if (!pcheck(player)) return;

   cache.playSound(player, 'item.book.page_turn');

   const form = new ActionFormData();
   form.title('Report | แจ้งปัญหา');
   form.body('แจ้งปัญหาต่างได้ที่นี้เลย!!');
   form.button('บันทึกการอัปเดต (Patch Note)');
   form.button('แจ้งปัญหา (Report)');
   form.button('กล่องตอบกลับ (Inbox)');

   if (isAdmin(player)) {
      form.button('แผงควบคุม (Admin)');
   }
   form.label('                @Sleeplite 2026');
   showForm(player, form, 'menu', (res) => {
      if (res.canceled) return;
      if (res.selection === 0) note(player);
      if (res.selection === 1) reportmenu(player);
      if (res.selection === 2) inbox(player);
      if (res.selection === 3 && isAdmin(player)) adminpanel(player);
   }).catch((error) => logError('Report', 'System Error (Menu)', error));
};
