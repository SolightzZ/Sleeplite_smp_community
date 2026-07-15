import { CONFIG } from '../config.js';
import { addChest, countByPlayer, getByKey, getByLocation } from '../core/database.js';
import { logError } from '../events/logger.js';
import { cache } from '../shared/cache.js';
import { showAddChestForm } from '../ui/addChest.js';
import { findDoubleChestPartner, findItemInChest, formatItemName, getChestKey } from '../utils/helpers.js';
import { validateChestBlock } from '../utils/validation.js';

export function getAddChestFormData(itemInfo) {
   if (!itemInfo) return { status: 'error', msg: '[x] ไม่พบสินค้าที่ขายได้' };

   return {
      status: 'success',
      data: {
         typeId: itemInfo.typeId,
         displayName: formatItemName(itemInfo.typeId),
         amount: itemInfo.amount,
         hasEnchant: !!itemInfo.enchantments,
      },
   };
}

export function startAddChest(player) {
   const block = player.getBlockFromViewDirection({ maxDistance: 5 })?.block;
   if (!block) {
      player.sendMessage('[?] กรุณามองไปที่หีบ (ระยะ 5 บล็อก)');
      return;
   }

   const valid = validateChestBlock(block);
   if (valid.status !== 'success') {
      player.sendMessage(valid.msg);
      return;
   }

   const key = getChestKey(block);
   if (getByKey(key)) {
      player.sendMessage('[x] หีบนี้ถูกลงทะเบียนร้านค้าแล้ว');
      return;
   }

   // เช็คหีบคู่ (Double Chest) ว่าว่างและลงทะเบียนแล้วหรือยัง
   let pairedBlock = null;
   let pairedKey = null;
   const partner = findDoubleChestPartner(block);
   if (partner) {
      pairedKey = getChestKey(partner);
      if (getByKey(pairedKey)) {
         player.sendMessage('[x] หีบข้างเคียงถูกลงทะเบียนร้านค้าแล้ว');
         return;
      }
      const partnerShop = getByLocation(pairedKey);
      if (partnerShop) {
         player.sendMessage('[x] หีบข้างเคียงเป็นส่วนหนึ่งของร้านค้าอื่น');
         return;
      }
      pairedBlock = partner;
   }

   const count = countByPlayer(player.name);
   if (count >= CONFIG.MAX_CHEST_PER_PLAYER) {
      player.sendMessage(`[x] คุณมีร้านค้าครบ ${CONFIG.MAX_CHEST_PER_PLAYER} แห่งแล้ว`);
      return;
   }

   const itemInfo = findItemInChest(block);
   if (!itemInfo) {
      player.sendMessage('[x] ไม่พบสินค้าที่ขายได้ — หีบต้องมีสินค้าอย่างน้อย 1 สแต็ค (64 ชิ้น) และต้องไม่ใช่เพชร');
      return;
   }
   const itemId = itemInfo.typeId;

   showAddChestForm(player, itemInfo, (p, pricePerSlot, slotsPerDiamond) => {
      try {
         const data = {
            name: { player: p.name, playId: p.id },
            itemId,
            pricePerSlot,
            slotsPerDiamond,
            loc: {
               x: block.location.x,
               y: block.location.y,
               z: block.location.z,
               dim: block.dimension.id,
            },
            pairedLoc: pairedBlock
               ? {
                    x: pairedBlock.location.x,
                    y: pairedBlock.location.y,
                    z: pairedBlock.location.z,
                    dim: pairedBlock.dimension.id,
                 }
               : undefined,
            createdAt: Date.now(),
         };
         addChest(key, data);
         if (pairedBlock) {
            const dpComp = cache.getComponent(pairedBlock, 'minecraft:dynamic_properties');
            if (dpComp) {
               dpComp.set('economy:shopKey', key);
            }
         }
         p.sendMessage(`[/] ลงทะเบียนร้านค้าสำเร็จ!${pairedBlock ? ' (Double Chest)' : ''}`);
      } catch (error) {
         p.sendMessage('[x] เกิดข้อผิดพลาดในการลงทะเบียน');
         logError('AddChest', 'Failed to register chest shop', error);
      }
   });
}
