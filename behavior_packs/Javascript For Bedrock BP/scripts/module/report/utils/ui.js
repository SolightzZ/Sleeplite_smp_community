import { MessageFormData } from '@minecraft/server-ui';
import { addSound } from '../../../plugin/utils';

const handleUiError = (player, source, error) => {
   if (player?.isValid) {
      player.sendMessage('§c[Report] เกิดข้อผิดพลาดในการเปิดเมนู');
   }

   const message = error instanceof Error ? (error.stack ?? error.message) : String(error);
   console.error(`[Report] ${source}: ${message}`);
};

export const showForm = (player, form, source, onSubmit) => {
   return form
      .show(player)
      .then((res) => {
         if (!player?.isValid) return;
         onSubmit(res);
      })
      .catch((error) => handleUiError(player, source, error));
};

export const sure = (player, onConfirm, onCancel) => {
   const ui = new MessageFormData();
   ui.title('ยืนยันการลบข้อมูล');
   ui.body('ท่านแน่ใจหรือไม่ที่จะลบรายการนี้? การกระทำนี้ไม่สามารถยกเลิกได้');
   ui.button1('Confirm (ยืนยัน)');
   ui.button2('Cancel (ยกเลิก)');

   addSound(player, 'item.book.page_turn');

   showForm(player, ui, 'sure', (res) => {
      if (res.canceled) {
         if (onCancel) onCancel();
         return;
      }
      if (res.selection === 0) onConfirm();
      else if (onCancel) onCancel();
   }).catch((error) => console.error('[ Report ] System Error (Sure): ' + error));
};
