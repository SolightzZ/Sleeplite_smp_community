import { ActionFormData } from '@minecraft/server-ui';
import { isAdmin } from '../utils/permission.js';
import { note } from './patch-note-menu.js';
import { reportmenu, inbox } from './report-menu.js';
import { adminpanel } from './admin-panel.js';
import { showForm } from '../utils/ui.js';

export const menu = (player) => {
    const form = new ActionFormData();
    form.title('เมนูหลัก (Main Menu)');
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
    }).catch((e) => console.warn('[ Report ] System Error (Menu): ' + e));
};
