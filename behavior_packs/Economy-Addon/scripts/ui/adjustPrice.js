import { ModalFormData } from '@minecraft/server-ui';

import { CONFIG } from '../config.js';
import { logError } from '../events/logger.js';
import { getAdjustPriceData } from '../form/adjustPriceLogic.js';

export function showAdjustPriceForm(player, shopKey, callback) {
   const result = getAdjustPriceData(shopKey);
   if (result.status !== 'success') {
      player.sendMessage(result.msg);
      return;
   }

   const { pricePerSlot, slotsPerDiamond } = result.data;
   const form = new ModalFormData()
      .title('ปรับราคา | Chest shop')
      .slider('ราคา (เพชร)', CONFIG.SLIDER_DIAMOND_MIN, CONFIG.SLIDER_DIAMOND_MAX, {
         defaultValue: pricePerSlot,
         valueStep: 1,
      })
      .slider('สแต็คสูงสุด/ครั้ง', CONFIG.SLIDER_SLOTS_MIN, CONFIG.SLIDER_SLOTS_MAX, {
         defaultValue: slotsPerDiamond,
         valueStep: 1,
      });

   form
      .show(player)
      .then((res) => {
         if (res.canceled) return;
         callback(player, shopKey, res.formValues[0], res.formValues[1]);
      })
      .catch((e) => logError('Form', 'show error', e));
}
