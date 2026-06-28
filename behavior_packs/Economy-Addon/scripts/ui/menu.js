import { ActionFormData } from '@minecraft/server-ui';

import { logError } from '../events/logger.js';
import { startAddChest } from '../form/addChestLogic.js';
import { startAdjustPrice } from '../form/adjustPriceLogic.js';
import { startDeleteChest } from '../form/deleteChestLogic.js';

export function showMainMenu(player) {
   const form = new ActionFormData()
      .title('เมนูหลัก | Chest shop')
      .body('เลือกเมนูที่ต้องการ')
      .button('เพิ่มร้านค้า', 'textures/ui/icons/icon_staffpicks.png')
      .button('ปรับราคา', 'textures/ui/dev_glyph_color.png')
      .divider()
      .button('ลบร้านค้า', 'textures/ui/icon_trash.png');

   form
      .show(player)
      .then((res) => {
         if (res.canceled) return;
         switch (res.selection) {
            case 0:
               startAddChest(player);
               break;
            case 1:
               startAdjustPrice(player);
               break;
            case 2:
               startDeleteChest(player);
               break;
         }
      })
      .catch((e) => logError('Form', 'show error', e));
}
