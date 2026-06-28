import { ModalFormData } from '@minecraft/server-ui';

import { CONFIG } from '../config.js';
import { logError } from '../events/logger.js';
import { getAddChestFormData } from '../form/addChestLogic.js';

export function showAddChestForm(player, itemInfo, callback) {
   const result = getAddChestFormData(itemInfo);
   if (result.status !== 'success') {
      player.sendMessage(result.msg);
      return;
   }

   const { displayName } = result.data;
   const form = new ModalFormData()
      .title('ลงทะเบียนร้านค้า | Chest shop')
      .slider(`${displayName} ราคา (เพชร) ต่อ 1 สแต็ค:`, CONFIG.SLIDER_DIAMOND_MIN, CONFIG.SLIDER_DIAMOND_MAX, {
         defaultValue: CONFIG.SLIDER_DIAMOND_DEFAULT,
         valueStep: 1,
      })
      .slider('จำนวนสแต็คที่ขายได้ต่อครั้ง:', CONFIG.SLIDER_SLOTS_MIN, CONFIG.SLIDER_SLOTS_MAX, {
         defaultValue: CONFIG.SLIDER_SLOTS_DEFAULT,
         valueStep: 1,
      });

   form
      .show(player)
      .then((res) => {
         if (res.canceled) return;
         callback(player, res.formValues[0], res.formValues[1]);
      })
      .catch((e) => logError('Form', 'show error', e));
}
