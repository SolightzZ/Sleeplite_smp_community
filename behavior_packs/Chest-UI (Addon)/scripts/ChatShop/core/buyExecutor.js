import { ItemStack } from '@minecraft/server';
import { CONFIG } from '../config.js';
import blockUtils from '../utils/blockUtils.js';
import helpers from '../utils/helpers.js';
import shopDatabase from './database.js';

class BuyExecutor {
    executeBuy = (player, shop, entry) => {
        try {
            const { slotKey, slotIndex, itemId, amount, price } = entry;

            const buyerInv = player.getComponent('minecraft:inventory')?.container;
            if (!buyerInv) return false;

            const diamondsRemoved = this.pay(buyerInv, price);
            if (!diamondsRemoved) {
                player.sendMessage(`§c[Shop] คุณมีเพชรไม่พอ`);
                return false;
            }

            const chestContainer = blockUtils.getContainer(shop);
            if (!chestContainer) {
                helpers.addDiamonds(buyerInv, price);
                player.sendMessage(`§c[Shop] ร้านค้าเสียหาย ไม่สามารถซื้อได้`);
                return false;
            }

            const chestItemStack = chestContainer.getItem(slotIndex);
            if (!chestItemStack || chestItemStack.typeId !== itemId || chestItemStack.amount < amount) {
                helpers.addDiamonds(buyerInv, price);
                player.sendMessage(`§c[Shop] สินค้าหมด`);
                return false;
            }

            const freeSpace = this.getFreeSpace(buyerInv, itemId);
            if (freeSpace < amount) {
                helpers.addDiamonds(buyerInv, price);
                player.sendMessage(`§c[Shop] ช่องเก็บของเต็ม (ต้องการ ${amount} ช่อง แต่เหลือ ${freeSpace})`);
                return false;
            }

            chestContainer.setItem(slotIndex, undefined);

            const remain = buyerInv.addItem(chestItemStack);
            if (remain) {
                helpers.addDiamonds(buyerInv, price);
                chestContainer.setItem(slotIndex, remain);
                player.sendMessage(`§c[Shop] เกิดข้อผิดพลาดในการซื้อ`);
                return false;
            }

            const timestamp = Math.floor(Date.now() / 1000);
            delete shop.prices[slotKey];

            shop.stats.totalSales = (shop.stats.totalSales || 0) + 1;
            shop.stats.totalRevenue = (shop.stats.totalRevenue || 0) + price;
            shop.status.pendingRevenue = (shop.status.pendingRevenue || 0) + price;
            shop.lastSale = timestamp;

            const buyerId = player.id;
            if (!shop.buyers[buyerId]) {
                shop.buyers[buyerId] = {
                    name: player.name,
                    buyCount: 0,
                    spent: 0,
                    lastBuy: 0,
                };
                shop.stats.uniqueBuyers = Object.keys(shop.buyers).length;
            }

            const buyer = shop.buyers[buyerId];
            buyer.buyCount = (buyer.buyCount || 0) + 1;
            buyer.spent = (buyer.spent || 0) + price;
            buyer.lastBuy = timestamp;

            shop.stats.repeatBuyers = Object.values(shop.buyers).filter((b) => b.buyCount > 1).length;

            const saleId = `sale_${shop.shopId}_${slotKey}_${timestamp}`;
            shop.salesHistory[saleId] = {
                buyerId,
                buyerName: player.name,
                itemId,
                amount,
                price,
                timestamp,
            };

            shopDatabase.save();

            const itemName = helpers.formatName(itemId);
            player.sendMessage(`§a[Shop] ซื้อ ${itemName} x${amount} สำเร็จ! (${price} ไดม่อน)`);
            return true;
        } catch (error) {
            console.error('[Shop] executeBuy:', error);
            return false;
        }
    };

    pay = (container, amount) => {
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
            console.error('[Shop] pay:', error);
            return false;
        }
    };

    getFreeSpace = (container, itemId) => {
        return Array.from({ length: container.size }).reduce((space, _, slot) => {
            const item = container.getItem(slot);
            if (!item) return space + 64;
            if (item.typeId === itemId && item.amount < 64) return space + (64 - item.amount);
            return space;
        }, 0);
    };
}

export default new BuyExecutor();
