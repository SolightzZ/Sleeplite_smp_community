import { ActionFormData } from '@minecraft/server-ui';

import { getByPlayer, updateChest } from '../core/database.js';
import { logError } from '../events/logger.js';
import { showAdjustPriceForm } from '../ui/adjustPrice.js';
import { formatItemName } from '../utils/helpers.js';
import { requireShopRecord } from '../utils/validation.js';

export function getAdjustPriceData(shopKey) {
   const shop = requireShopRecord(shopKey);
   if (shop.status !== 'success') return shop;
   const rec = shop.record;

   return {
      status: 'success',
      data: {
         pricePerSlot: rec.pricePerSlot,
         slotsPerDiamond: rec.slotsPerDiamond ?? 3,
      },
   };
}

export function startAdjustPrice(player) {
   const shops = getByPlayer(player.name);
   if (shops.length === 0) {
      player.sendMessage('[x] คุณยังไม่มีร้านค้า');
      return;
   }

   const form = new ActionFormData();
   form.title('เลือกร้านค้า | Chest shop');
   form.body('เลือกร้านค้าที่ต้องการปรับราคา');

   for (const s of shops) {
      const name = s.itemId ? formatItemName(s.itemId) : `(${s.loc.x}, ${s.loc.y}, ${s.loc.z})`;
      form.button(`${name}\n${s.pricePerSlot} เพชร`);
   }

   form
      .show(player)
      .then((res) => {
         if (res.canceled) return;
         const selected = shops[res.selection];
         showAdjustPriceForm(player, selected.key, (p, shopKey, newPrice, newSlots) => {
            const ok = updateChest(shopKey, { pricePerSlot: newPrice, slotsPerDiamond: newSlots });
            if (ok) {
               p.sendMessage(`[/] ปรับราคาสำเร็จ! (${newPrice} เพชร/สแต็ค, ${newSlots} สแต็ค)`);
            } else {
               p.sendMessage('[x] ไม่สามารถปรับราคาได้');
            }
         });
      })
      .catch((e) => logError('Form', 'show error', e));
}
