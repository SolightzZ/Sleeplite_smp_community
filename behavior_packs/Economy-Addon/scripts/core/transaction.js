import { EnchantmentTypes, ItemStack, world } from '@minecraft/server';

import { CONFIG } from '../config.js';
import { logError } from '../events/logger.js';
import { findItemInContainer, formatItemName, getChestContainer, getPlayerContainer, giveItemsToPlayer, removeItemsFromContainer } from '../utils/helpers.js';
import { requireShopRecord } from '../utils/validation.js';
import { updateChest } from './database.js';
import { getSnapshotEntry, hasActiveSnapshot, removeSnapshot, setSnapshot } from './state.js';

function _snapshotContainer(container) {
   const data = [];
   for (let i = 0; i < container.size; i++) {
      const item = container.getItem(i);
      if (!item) {
         data.push(null);
         continue;
      }
      const snap = { typeId: item.typeId, amount: item.amount };
      if (item.nameTag) snap.nameTag = item.nameTag;
      const lore = item.getLore();
      if (lore.length) snap.lore = [...lore];
      if (item.keepOnDeath) snap.keepOnDeath = item.keepOnDeath;
      if (item.lockMode !== 'none') snap.lockMode = item.lockMode;
      const canDestroy = item.getCanDestroy();
      if (canDestroy.length) snap.canDestroy = [...canDestroy];
      const canPlaceOn = item.getCanPlaceOn();
      if (canPlaceOn.length) snap.canPlaceOn = [...canPlaceOn];
      const ench = item.getComponent('enchantable');
      if (ench) {
         const enchants = ench.getEnchantments();
         if (enchants.length) {
            snap.enchantments = enchants.map((e) => ({ id: e.type.id, level: e.level }));
         }
      }
      const dur = item.getComponent('durability');
      if (dur) snap.durabilityDamage = dur.damage;
      data.push(snap);
   }
   return data;
}

function _restoreContainer(container, data) {
   for (let i = 0; i < data.length; i++) {
      if (!data[i]) {
         container.setItem(i, undefined);
         continue;
      }
      const item = new ItemStack(data[i].typeId, data[i].amount);
      if (data[i].nameTag) item.nameTag = data[i].nameTag;
      if (data[i].lore) item.setLore(data[i].lore);
      if (data[i].keepOnDeath) item.keepOnDeath = data[i].keepOnDeath;
      if (data[i].lockMode) item.lockMode = data[i].lockMode;
      if (data[i].canDestroy) item.setCanDestroy(data[i].canDestroy);
      if (data[i].canPlaceOn) item.setCanPlaceOn(data[i].canPlaceOn);
      if (data[i].enchantments) {
         const ench = item.getComponent('enchantable');
         if (ench) {
            for (const e of data[i].enchantments) {
               const enchantType = EnchantmentTypes.get(e.id);
               if (enchantType) ench.addEnchantment({ type: enchantType, level: e.level });
            }
         }
      }
      if (data[i].durabilityDamage !== undefined) {
         const dur = item.getComponent('durability');
         if (dur) dur.damage = data[i].durabilityDamage;
      }
      container.setItem(i, item);
   }
}

function _countItemInContainer(container, itemId) {
   let total = 0;
   for (let i = 0, len = container.size; i < len; i++) {
      const s = container.getItem(i);
      if (s?.typeId === itemId) total += s.amount;
   }
   return total;
}

function _checkBuyerSpace(buyerInv, itemId, totalItems) {
   const maxStack = CONFIG.DEFAULT_MAX_STACK;
   let existingCapacity = 0;
   let emptySlots = 0;
   for (let i = 0, len = buyerInv.size; i < len; i++) {
      const s = buyerInv.getItem(i);
      if (!s) {
         emptySlots++;
         continue;
      }
      if (s.typeId === itemId) existingCapacity += maxStack - s.amount;
   }
   const remainingAfterPartial = Math.max(0, totalItems - existingCapacity);
   const slotsNeeded = Math.ceil(remainingAfterPartial / maxStack);
   if (slotsNeeded > emptySlots) {
      return {
         ok: false,
         msg: `[x] เนื้อที่ในช่องเก็บของไม่พอ (ต้องการ ${slotsNeeded} ช่องว่าง มี ${emptySlots} ช่อง)`,
      };
   }
   return { ok: true };
}

function _restoreChest(entry) {
   if (!entry.chestInv) return;
   try {
      const container = getChestContainer(entry.detail.loc);
      if (container) _restoreContainer(container, entry.chestInv);
   } catch (error) {
      logError('RestoreChest', 'Failed to restore chest snapshot', error);
   }
}

export function createTransaction(buyer, chestKey, slotsWanted) {
   const shop = requireShopRecord(chestKey);
   if (shop.status !== 'success') return shop;
   const record = shop.record;

   const { loc, pricePerSlot, slotsPerDiamond } = record;
   const owner = record.name?.player;
   if (!owner) return { status: 'error', msg: '[x] ข้อมูลร้านค้าไม่ถูกต้อง' };
   if (buyer.name === owner) return { status: 'error', msg: '[x] ไม่สามารถซื้อของจากร้านตัวเอง' };
   const maxPerTxn = slotsPerDiamond ?? CONFIG.SLIDER_SLOTS_DEFAULT;
   if (slotsWanted > maxPerTxn) {
      return { status: 'error', msg: `[x] ซื้อได้ครั้งละไม่เกิน ${maxPerTxn} สแต็ค` };
   }

   const container = getChestContainer(loc);
   if (!container) return { status: 'error', msg: '[x] ไม่พบหีบที่ตำแหน่งนี้' };

   const itemId = record.itemId ?? findItemInContainer(container);
   if (!itemId) return { status: 'error', msg: '[x] หีบว่างเปล่า — ไม่มีสินค้าให้ซื้อ' };

   const available = _countItemInContainer(container, itemId);

   const totalItems = slotsWanted * CONFIG.ITEMS_PER_SLOT;
   if (available < totalItems) return { status: 'error', msg: `[x] สินค้าไม่เพียงพอ (มี ${available} ต้องการ ${totalItems})` };

   const totalCost = slotsWanted * pricePerSlot;
   if (totalCost > CONFIG.MAX_DIAMOND_PAYMENT) return { status: 'error', msg: `[x] ราคารวมเกิน ${CONFIG.MAX_DIAMOND_PAYMENT} เพชร` };
   const buyerInv = getPlayerContainer(buyer);
   const diamonds = _countItemInContainer(buyerInv, CONFIG.DIAMOND_ID);
   if (diamonds < totalCost) return { status: 'error', msg: `[x] เพชรไม่พอ (มี ${diamonds} ต้องการ ${totalCost})` };

   const space = _checkBuyerSpace(buyerInv, itemId, totalItems);
   if (!space.ok) return { status: 'error', msg: space.msg };

   return {
      status: 'success',
      detail: {
         chestKey,
         itemId,
         slotsWanted,
         totalItems,
         totalCost,
         pricePerSlot,
         owner,
         loc,
      },
   };
}

export function executeTransaction(buyer, detail) {
   const { chestKey, itemId, totalItems, totalCost, owner, loc } = detail;

   const container = getChestContainer(loc);
   if (!container) return { status: 'error', msg: '[x] ไม่พบหีบที่ตำแหน่งนี้' };

   const buyerInv = getPlayerContainer(buyer);

   // เช็กซ้ำอีกครั้งเผื่อ inventory เปลี่ยนไปตั้งแต่ตอนถ่าย snapshot
   const diamondsNow = _countItemInContainer(buyerInv, CONFIG.DIAMOND_ID);
   if (diamondsNow < totalCost) {
      return {
         status: 'error',
         msg: `[x] เพชรไม่พอ (เหลือ ${diamondsNow} ต้องการ ${totalCost}) — กรุณาทำรายการใหม่`,
      };
   }

   const stockNow = _countItemInContainer(container, itemId);
   if (stockNow < totalItems) {
      return { status: 'error', msg: `[x] สินค้าในหีบไม่พอ (เหลือ ${stockNow} ต้องการ ${totalItems})` };
   }

   const space = _checkBuyerSpace(buyerInv, itemId, totalItems);
   if (!space.ok) return { status: 'error', msg: space.msg };

   removeItemsFromContainer(buyerInv, CONFIG.DIAMOND_ID, totalCost);
   removeItemsFromContainer(container, itemId, totalItems);
   giveItemsToPlayer(buyerInv, itemId, totalItems, container, buyer, '[?] ช่องเก็บของเต็ม — คืนสินค้าบางส่วนไปที่หีบ');
   const diamondStack = new ItemStack(CONFIG.DIAMOND_ID, totalCost);
   const diamondLeftover = container.addItem(diamondStack);
   if (diamondLeftover) {
      const returned = buyerInv.addItem(diamondLeftover);
      if (returned) {
         buyer.dimension.spawnItem(returned, buyer.location);
      }
   }

   const ownerPlayer = world.getAllPlayers().find((p) => p.name === owner);
   if (ownerPlayer) {
      try {
         ownerPlayer.sendMessage(`[/] ${buyer.name} ซื้อ ${formatItemName(itemId)} x${totalItems} จากร้านของคุณ (+${totalCost} เพชร)`);
      } catch (error) {
         logError('SendMessage', 'Failed to send message', error);
      }
   }

   buyer.sendMessage(`[/] ซื้อ ${formatItemName(itemId)} x${totalItems} สำเร็จ (-${totalCost} เพชร)`);
   updateChest(chestKey, { lastSale: Date.now() });

   return { status: 'success' };
}

// player inventory บังคับ, chest inventory เป็นทางเลือก
export function prepareSnapshot(buyer, detail) {
   if (hasActiveSnapshot(buyer.id)) {
      return { status: 'error', msg: '[x] คุณมีธุรกรรมค้างอยู่ กรุณารอให้เสร็จก่อน' };
   }

   const playerContainer = getPlayerContainer(buyer);
   const playerInv = _snapshotContainer(playerContainer);

   let chestInv = null;
   try {
      const container = getChestContainer(detail.loc);
      if (container) chestInv = _snapshotContainer(container);
   } catch (error) {
      logError('PrepareSnapshot', 'Failed to snapshot chest', error);
   }

   setSnapshot(buyer.id, detail, playerInv, chestInv);
   return { status: 'success' };
}

// ถ้าล้มเหลว rollback inventory ทั้ง player และหีบ
export function commitSnapshot(buyer) {
   const entry = getSnapshotEntry(buyer.id);
   if (!entry) return { status: 'error', msg: '[x] ไม่พบธุรกรรมที่ค้างอยู่' };

   const result = executeTransaction(buyer, entry.detail);
   if (result.status !== 'success') {
      try {
         const playerContainer = getPlayerContainer(buyer);
         _restoreContainer(playerContainer, entry.playerInv);
      } catch (error) {
         logError('CommitSnapshot', 'Failed to restore player snapshot on rollback', error);
      }

      _restoreChest(entry);
      removeSnapshot(buyer.id);
      return result;
   }

   removeSnapshot(buyer.id);
   return { status: 'success' };
}

export function cancelSnapshot(buyer) {
   removeSnapshot(buyer.id);
}
