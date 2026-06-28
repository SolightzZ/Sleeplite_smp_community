import { getByPlayer, removeChest } from '../core/database.js';
import { showDeleteChestForm } from '../ui/deleteChest.js';

export function getDeleteChestData(playerName) {
   const shops = getByPlayer(playerName);
   if (shops.length === 0) return { status: 'error', msg: '[x] คุณยังไม่มีร้านค้า' };

   return {
      status: 'success',
      data: { shops },
   };
}

export function startDeleteChest(player) {
   showDeleteChestForm(player, (p, shopKey) => {
      const ok = removeChest(shopKey);
      if (ok) {
         p.sendMessage('[/] ลบร้านค้าเรียบร้อยแล้ว');
      } else {
         p.sendMessage('[x] ไม่สามารถลบได้');
      }
   });
}
