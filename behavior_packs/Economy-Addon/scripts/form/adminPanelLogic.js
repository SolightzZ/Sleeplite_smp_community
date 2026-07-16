import { CONFIG } from '../config.js';
import { getAll, getDbSizeInfo, removeChest } from '../core/database.js';

export function getAdminShopList(page = 0) {
   const all = Object.entries(getAll());

   if (all.length === 0) {
      return { status: 'error', msg: '[x] ไม่มีร้านค้าในระบบ' };
   }

   const totalPages = Math.ceil(all.length / CONFIG.ADMIN_PAGE_SIZE) || 1;
   const safePage = Math.min(Math.max(page, 0), totalPages - 1);
   const start = safePage * CONFIG.ADMIN_PAGE_SIZE;
   const end = start + CONFIG.ADMIN_PAGE_SIZE;
   const slice = all.slice(start, end);

   return {
      status: 'success',
      data: {
         shops: slice.map(([key, v]) => ({
            key,
            name: v.name,
            itemId: v.itemId,
            pricePerSlot: v.pricePerSlot,
            loc: v.loc,
         })),
         page: safePage,
         totalPages,
         totalShops: all.length,
      },
   };
}

export function getDbInfoData() {
   const info = getDbSizeInfo();
   return {
      status: 'success',
      data: { bytes: info.bytes, shopsCount: info.shopsCount },
   };
}

export function adminDeleteShop(key) {
   const ok = removeChest(key);
   if (!ok) return { status: 'error', msg: '[x] ไม่พบร้านค้าหรือลบไม่สำเร็จ' };
   return { status: 'success', msg: '[/] ลบร้านค้าแล้ว (Admin)' };
}
