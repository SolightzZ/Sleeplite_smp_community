import { ActionFormData } from '@minecraft/server-ui';

import { logError } from '../events/logger.js';
import { getDeleteChestData } from '../form/deleteChestLogic.js';
import { formatItemName } from '../utils/helpers.js';
import { showStepTwo } from './confirmTwoStep.js';

function shopLabel(s) {
   if (s.itemId) return `${formatItemName(s.itemId)}\n${s.pricePerSlot} เพชร`;
   const l = s.loc;
   return `(${l.x}, ${l.y}, ${l.z})\n${s.pricePerSlot} เพชร`;
}

export function showDeleteChestForm(player, callback) {
   const result = getDeleteChestData(player.name);
   if (result.status !== 'success') {
      player.sendMessage(result.msg);
      return;
   }

   const { shops } = result.data;
   const form = new ActionFormData().title('ลบร้านค้า | Chest shop').body('เลือกร้านค้าที่ต้องการลบ');

   for (const s of shops) {
      form.button(shopLabel(s));
   }

   form
      .show(player)
      .then((res) => {
         if (res.canceled) return;
         const selected = shops[res.selection];
         const label = shopLabel(selected);
         const form2 = new ActionFormData().title('ลบร้านค้า | Chest shop').body(`คุณต้องการลบร้านค้านี้หรือไม่?\n\n${label}`).button('ลบ').button('ยกเลิก');
         form2
            .show(player)
            .then((res2) => {
               if (res2.canceled || res2.selection === 1) return;
               showStepTwo(player, 'ยืนยันการลบ | Chest shop', `คุณแน่ใจหรือไม่?\n\n${label}\n\nกดยืนยันอีกครั้งเพื่อลบ`, (p) => callback(p, selected.key));
            })
            .catch((e) => logError('Form', 'show error', e));
      })
      .catch((e) => logError('Form', 'show error', e));
}
