import { ActionFormData } from '@minecraft/server-ui';

import { cancelSnapshot } from '../core/transaction.js';
import { logError } from '../events/logger.js';
import { formatItemName } from '../utils/helpers.js';

export function showStepTwo(player, title, body, onConfirm, onCancel) {
   const form = new ActionFormData().title(title).body(body).button('ยืนยัน').button('ยกเลิก');

   form
      .show(player)
      .then((res) => {
         if (res.canceled || res.selection === 1) {
            player.sendMessage('[?] ยกเลิก');
            if (onCancel) onCancel(player);
            return;
         }
         onConfirm(player);
      })
      .catch((e) => logError('Form', 'show error', e));
}

export function showConfirmTwoStep(buyer, detail, onConfirm) {
   const { itemId, totalItems, totalCost } = detail;
   const name = formatItemName(itemId);

   const form = new ActionFormData()
      .title('ยืนยันการซื้อ | Chest shop')
      .body(`สินค้า: ${name} x${totalItems}\n` + `ราคา: ${totalCost} เพชร\n\n` + `กดยืนยันเพื่อทำรายการ`)
      .button('ยืนยัน')
      .button('ยกเลิก');

   form
      .show(buyer)
      .then((res) => {
         if (res.canceled || res.selection === 1) {
            cancelSnapshot(buyer);
            buyer.sendMessage('[?] ยกเลิกการซื้อ');
            return;
         }
         const name = formatItemName(itemId);
         showStepTwo(
            buyer,
            'ยืนยันอีกครั้ง | Chest shop',
            `คุณแน่ใจหรือไม่?\n\nสินค้า: ${name} x${totalItems}\nราคา: ${totalCost} เพชร\n\nกดยืนยันอีกครั้งเพื่อทำรายการ`,
            (p) => {
               onConfirm(p);
            },
            cancelSnapshot,
         );
      })
      .catch((e) => logError('Form', 'show error', e));
}
