import { ActionFormData } from '@minecraft/server-ui';
import { logError } from '../events/logger.js';
import { adminDeleteShop, getAdminShopList, getDbInfoData } from '../form/adminPanelLogic.js';
import { cache } from '../shared/cache.js';
import { isAdmin } from '../utils/permission.js';
import { showStepTwo } from './confirmTwoStep.js';

export function showAdminPanel(player) {
   if (!isAdmin(player)) {
      player.sendMessage('[x] คุณไม่มีสิทธิ์เข้าถึงเมนูนี้');
      return;
   }

   const form = new ActionFormData();
   form.title('จัดการระบบ | Chest shop');
   form.body('จัดการระบบเศรษฐกิจ');
   form.button('Shop List');
   form.button('Database Info');

   form
      .show(player)
      .then((res) => {
         if (res.canceled) return;
         switch (res.selection) {
            case 0:
               showAllShops(player);
               break;
            case 1: {
               const result = getDbInfoData();
               player.sendMessage(`[?] - Database Info -\nSize: ~${result.data.bytes} bytes\nShops: ${result.data.shopsCount}\n-------`);
               break;
            }
         }
      })
      .catch((e) => logError('Form', 'show error', e));
}

function showAllShops(player, page = 0) {
   const result = getAdminShopList(page);
   if (result.status !== 'success') {
      player.sendMessage(result.msg);
      return;
   }

   const { shops, page: curPage, totalPages, totalShops } = result.data;
   const form = new ActionFormData().title(`ร้านค้าทั้งหมด (${curPage + 1}/${totalPages}) | Chest shop`).body(`ร้านค้าทั้งหมด: ${totalShops}`);

   for (const s of shops) {
      const itemLabel = s.itemId ?? `(${s.loc?.x ?? '?'}, ${s.loc?.y ?? '?'}, ${s.loc?.z ?? '?'})`;
      form.button(`${s.name?.player ?? '?'}\n${itemLabel} — ${s.pricePerSlot}`);
   }

   if (totalPages > 1) {
      form.button(curPage + 1 < totalPages ? 'Next ' : ' First');
   }

   form
      .show(player)
      .then((res) => {
         if (res.canceled) return;
         if (res.selection < shops.length) {
            const shop = shops[res.selection];
            const itemLabel = shop.itemId ?? `(${shop.loc?.x ?? '?'}, ${shop.loc?.y ?? '?'}, ${shop.loc?.z ?? '?'})`;
            const form2 = new ActionFormData()
               .title('จัดการร้านค้า | Chest shop')
               .body(`ร้าน: ${itemLabel}\nเจ้าของ: ${shop.name?.player ?? '?'}\nราคา: ${shop.pricePerSlot} เพชร`)
               .button('Del shop')
               .button('Warp shop');
            form2
               .show(player)
               .then((res2) => {
                  if (res2.canceled) return;
                  if (res2.selection === 0) {
                     const confirmForm = new ActionFormData().title('ยืนยันการลบ | Chest shop').body(`คุณต้องการลบร้านค้านี้หรือไม่?\n\n${itemLabel}`).button('ลบ').button('ยกเลิก');
                     confirmForm
                        .show(player)
                        .then((res3) => {
                           if (res3.canceled || res3.selection === 1) return;
                           showStepTwo(player, 'ยืนยันการลบ | Chest shop', `คุณแน่ใจหรือไม่?\n\n${itemLabel}\n\nกดยืนยันอีกครั้งเพื่อลบ`, () => {
                              const delResult = adminDeleteShop(shop.key);
                              player.sendMessage(delResult.msg);
                           });
                        })
                        .catch((e) => logError('Form', 'show error', e));
                  } else {
                     const loc = shop.loc;
                     if (loc) {
                        const dim = cache.getDimension(loc.dim);
                        dim.runCommandAsync(`tp "${player.name}" ${loc.x} ${loc.y} ${loc.z}`);
                        player.sendMessage(`[/] วาปไปร้านค้า ${itemLabel} แล้ว`);
                     } else {
                        player.sendMessage('[x] ไม่พบตำแหน่งร้านค้า');
                     }
                  }
               })
               .catch((e) => logError('Form', 'show error', e));
         } else {
            showAllShops(player, curPage + 1 < totalPages ? curPage + 1 : 0);
         }
      })
      .catch((e) => logError('Form', 'show error', e));
}
