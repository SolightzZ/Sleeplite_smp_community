import { CONFIG } from '../config.js';
import { commitSnapshot, createTransaction, prepareSnapshot } from '../core/transaction.js';
import { showBuyForm } from '../ui/buyForm.js';
import { showConfirmTwoStep } from '../ui/confirmTwoStep.js';
import { findItemInContainer, formatItemName, getChestContainer } from '../utils/helpers.js';
import { requireShopRecord } from '../utils/validation.js';

// เตรียมข้อมูลฟอร์มซื้อ — ถ้า record ไม่มี itemId ให้หาเองจากของในหีบ
export function getBuyFormData(chestKey) {
   const shop = requireShopRecord(chestKey);
   if (shop.status !== 'success') return shop;
   const record = shop.record;

   const { loc, pricePerSlot, slotsPerDiamond } = record;
   let displayName;
   let itemId;
   let available = 0;

   if (record.itemId) {
      itemId = record.itemId;
      displayName = formatItemName(itemId);
   }

   const container = getChestContainer(loc);
   if (container) {
      if (!itemId) {
         itemId = findItemInContainer(container);
         displayName = itemId ? formatItemName(itemId) : '???';
      }
      // นับเฉพาะจำนวนเต็มสแต็ค (เศษไม่นับ)
      for (let i = 0, len = container.size; i < len; i++) {
         const s = container.getItem(i);
         if (s?.typeId === itemId) {
            available += Math.floor(s.amount / CONFIG.ITEMS_PER_SLOT) * CONFIG.ITEMS_PER_SLOT;
         }
      }
   } else if (!itemId) {
      displayName = '???';
   }

   if (!itemId) return { status: 'error', msg: '[x] ไม่พบสินค้าในหีบ' };

   const stacksAvail = available / CONFIG.ITEMS_PER_SLOT;
   const maxPerTxn = slotsPerDiamond ?? CONFIG.SLIDER_SLOTS_DEFAULT;
   const maxStacks = Math.min(stacksAvail, CONFIG.SLIDER_SLOTS_MAX, maxPerTxn);
   if (maxStacks < 1) return { status: 'error', msg: '[x] สินค้าในหีบไม่พอ' };

   const defaultSlots = Math.min(CONFIG.SLIDER_SLOTS_DEFAULT, maxStacks);
   const defaultTotal = defaultSlots * pricePerSlot;

   return {
      status: 'success',
      data: {
         chestKey,
         displayName,
         available,
         stacksAvail,
         pricePerSlot,
         maxPerTxn,
         maxStacks,
         defaultSlots,
         defaultTotal,
      },
   };
}

// ขั้นตอนการซื้อ: แสดงฟอร์ม → validate → ถ่าย snapshot → ยืนยัน 2 ครั้ง → รันธุรกรรม
export function startBuy(player, chestKey) {
   showBuyForm(player, chestKey, (buyer, key, slotsWanted) => {
      const result = createTransaction(buyer, key, slotsWanted);
      if (result.status !== 'success') {
         buyer.sendMessage(result.msg);
         return;
      }

      const { detail } = result;
      const snap = prepareSnapshot(buyer, detail);
      if (snap.status !== 'success') {
         buyer.sendMessage(snap.msg);
         return;
      }

      showConfirmTwoStep(buyer, detail, (confirmedBuyer) => {
         const execResult = commitSnapshot(confirmedBuyer);
         if (execResult.status !== 'success') {
            confirmedBuyer.sendMessage(execResult.msg);
         }
      });
   });
}
