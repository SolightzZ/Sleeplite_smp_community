import { ItemStack } from '@minecraft/server';
import { CONFIG } from '../config.js';
import shopDatabase from '../data/database.js';
import { getContainer } from '../utils/blockUtils.js';
import { addCurrency, formatName } from '../utils/helpers.js';

export function buy(player, shop, purchaseEntry) {
    try {
        const { slotKey, slotIndex, itemId, amount: buyAmount, price, totalPrice } = purchaseEntry;

        const usedPrice = totalPrice ?? price;

        const buyerInventory = player.getComponent('minecraft:inventory')?.container;

        if (!buyerInventory) return false;

        const paymentSuccessful = removeCurrency(buyerInventory, usedPrice);
        if (!paymentSuccessful) {
            player.sendMessage(`§c[Shop] คุณมีเพชรไม่พอ`);
            return false;
        }

        const container = getContainer(shop);
        if (!container) {
            addCurrency(buyerInventory, usedPrice);
            player.sendMessage(`§c[Shop] ร้านค้าเสียหาย ไม่สามารถซื้อได้`);
            return false;
        }

        const slotItem = container.getItem(slotIndex);
        if (!slotItem || slotItem.typeId !== itemId || slotItem.amount < buyAmount) {
            addCurrency(buyerInventory, usedPrice);
            player.sendMessage(`§c[Shop] สินค้าหมด`);
            return false;
        }

        const availableItemSpace = remainingItemCapacity(buyerInventory, itemId);
        if (availableItemSpace < buyAmount) {
            addCurrency(buyerInventory, usedPrice);
            player.sendMessage(`§c[Shop] ช่องเก็บของเต็ม (ต้องการ ${buyAmount} ช่อง แต่เหลือ ${availableItemSpace})`);
            return false;
        }

        const slotAmount = slotItem.amount;

        const remainingInSlot = slotAmount - buyAmount;

        container.setItem(slotIndex, undefined);

        slotItem.amount = buyAmount;

        const remainder = buyerInventory.addItem(slotItem);

        if (remainder) {
            slotItem.amount = slotAmount;
            container.setItem(slotIndex, slotItem);
            addCurrency(buyerInventory, usedPrice);
            player.sendMessage(`§c[Shop] เกิดข้อผิดพลาดในการซื้อ`);
            return false;
        }

        if (remainingInSlot > 0) {
            slotItem.amount = remainingInSlot;
            container.setItem(slotIndex, slotItem);
            //คงราคาเดิม - การซื้อบางส่วนไม่เปลี่ยนราคาช่อง
        } else {
            delete shop.prices[slotKey];
        }

        const timestamp = Math.floor(Date.now() / 1000);

        shop.status.pendingRevenue = (shop.status.pendingRevenue || 0) + usedPrice;

        shop.lastSale = timestamp;

        const buyerId = player.id;

        if (!shop.buyers) shop.buyers = {};

        if (!shop.buyers[buyerId]) {
            shop.buyers[buyerId] = {
                playerName: player.name,
                buyCount: 0,
                spent: 0,
                lastBuy: 0,
            };
        }

        const buyer = shop.buyers[buyerId];

        buyer.buyCount = (buyer.buyCount || 0) + 1;

        buyer.spent = (buyer.spent || 0) + usedPrice;

        buyer.lastBuy = timestamp;

        if (!Array.isArray(shop.salesHistory)) {
            shop.salesHistory = [];
        }

        shop.salesHistory.push({
            buyerId,
            buyerName: player.name,
            itemId,
            amount: buyAmount,
            price: usedPrice,
            timestamp,
        });

        shopDatabase.save();

        player.sendMessage(`§a[Shop] ซื้อ ${formatName(itemId)} x${buyAmount} สำเร็จ! (${usedPrice} ไดม่อน)`);
        return true;
    } catch (error) {
        console.error('[Shop] buy:', error);
        return false;
    }
}

function removeCurrency(container, amount) {
    try {
        let remaining = amount;

        const size = container.size;

        for (const slot of Array.from({ length: size }).keys()) {
            if (remaining <= 0) break;
            const item = container.getItem(slot);

            if (!item || item.typeId !== CONFIG.currencyId) continue;

            if (item.amount > remaining) {
                container.setItem(slot, new ItemStack(CONFIG.currencyId, item.amount - remaining));
                remaining = 0;
            } else {
                remaining -= item.amount;
                container.setItem(slot, undefined);
            }
        }

        return remaining === 0;
    } catch (error) {
        console.error('[Shop] removeCurrency:', error);
        return false;
    }
}

function remainingItemCapacity(container, itemId) {
    return Array.from({ length: container.size }).reduce((space, _, slot) => {
        const item = container.getItem(slot);

        if (!item) return space + 64;

        if (item.typeId === itemId && item.amount < 64) return space + (64 - item.amount);

        return space;
    }, 0);
}
