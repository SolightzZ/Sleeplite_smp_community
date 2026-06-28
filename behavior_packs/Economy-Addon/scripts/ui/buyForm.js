import { ModalFormData } from '@minecraft/server-ui';

import { CONFIG } from '../config.js';
import { logError } from '../events/logger.js';
import { getBuyFormData } from '../form/buyLogic.js';

export function showBuyForm(player, chestKey, callback) {
   const result = getBuyFormData(chestKey);
   if (result.status !== 'success') {
      player.sendMessage(result.msg);
      return;
   }

   const { displayName, available, stacksAvail, pricePerSlot, maxPerTxn, maxStacks, defaultSlots, defaultTotal } = result.data;

   const form = new ModalFormData()
      .title('ซื้อสินค้า | Chest shop')
      .slider(
         `สินค้า: ${displayName}\n` + `จำนวนสินค้า ${available} ไอเทม\n` + `จำนวนสแต็ค ${stacksAvail} สแต็ค\n\n` + `${pricePerSlot} เพรช ต่อ ${maxPerTxn} สแต็ค`,
         CONFIG.SLIDER_SLOTS_MIN,
         maxStacks,
         { defaultValue: defaultSlots, valueStep: 1 },
      );

   form
      .show(player)
      .then((res) => {
         if (res.canceled) return;
         callback(player, chestKey, res.formValues[0]);
      })
      .catch((e) => logError('Form', 'show error', e));
}
