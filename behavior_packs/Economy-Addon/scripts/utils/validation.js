import { CONFIG } from '../config.js';
import { getByKey } from '../core/database.js';

export function validateChestBlock(block) {
   if (!block) return { status: 'error', msg: '[x] ไม่พบบล็อก' };
   if (block.typeId !== CONFIG.CHEST_ID) {
      return { status: 'error', msg: '[x] บล็อกนี้ไม่ใช่หีบ (Chest)' };
   }

   const inv = block.getComponent('inventory');
   if (!inv) {
      return { status: 'error', msg: '[x] ไม่สามารถเข้าถึง inventory ของหีบได้' };
   }
   return { status: 'success' };
}

export function requireShopRecord(shopKey) {
   const record = getByKey(shopKey);
   if (!record) return { status: 'error', msg: '[x] ไม่พบร้านค้านี้ในระบบ' };
   return { status: 'success', record };
}
