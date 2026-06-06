import { ActionFormData } from '@minecraft/server-ui';
import shopDatabase from '../core/database.js';
import blockUtils from '../utils/blockUtils.js';
import helpers from '../utils/helpers.js';
import uiUtils from '../utils/ui.js';
import { manageItems } from './manageItems.js';
import { showSettings } from './shopSettings.js';

export function showInfo(player, shop) {
    try {
        const container = blockUtils.getContainer(shop);
        const itemCount = container ? countChestItems(container) : 0;
        const salesCount = Object.values(shop.buyers || {}).reduce(
            (sum, b) => sum + (b.buyCount || 0),
            0,
        );
        const revenue = Object.values(shop.buyers || {}).reduce(
            (sum, b) => sum + (b.spent || 0),
            0,
        );
        const pending = shop.status.pendingRevenue ?? 0;
        const uniqueBuyers = Object.keys(shop.buyers || {}).length;

        const form = new ActionFormData()
            .title(`${shop.owner.playerName}'s Shop`)
            .body(
                `§fรายได้รวม: §e${revenue} $\n` +
                    `§fรายได้รอรับ: §e${pending} $\n` +
                    `§fยอดขาย: §f${salesCount} ครั้ง\n` +
                    `§fสินค้าในร้าน: §e${itemCount} รายการ\n` +
                    `§fผู้ซื้อ: §f${uniqueBuyers} คน`,
            )
            .button('รับรายได้', 'textures/items/diamond')
            .button('ตั้งค่า', 'textures/ui/settings_pause_menu_icon.png')
            .button('ย้อนกลับ');

        uiUtils.showForm(player, form, 'shop.info.inline', (res) => {
            if (res.canceled) return;
            switch (res.selection) {
                case 0:
                    claimRevenueUI(player, shop);
                    break;
                case 1:
                    showSettings(player, shop);
                    break;
                case 2:
                    manageItems(player, shop);
                    break;
            }
        });
    } catch (error) {
        console.error('[Shop] showInfo:', error);
    }
}

function claimRevenueUI(player, shop) {
    try {
        const amount = shop.status.pendingRevenue ?? 0;
        if (amount <= 0) {
            player.sendMessage(`§c[Shop] ไม่มีรายได้รอรับ`);
            showInfo(player, shop);
            return;
        }

        const inventory = player.getComponent('minecraft:inventory')?.container;
        if (!inventory) return;

        const lost = helpers.addDiamonds(inventory, amount);
        if (lost > 0) {
            const paid = amount - lost;
            shop.status.pendingRevenue = lost;
            shopDatabase.save();
            if (paid > 0) {
                player.sendMessage(
                    `§c[Shop] ช่องเก็บของเต็ม! ได้รับเพียง ${paid} ไดม่อน (คงค้าง ${lost})`,
                );
            } else {
                player.sendMessage(`§c[Shop] ช่องเก็บของเต็ม! ไม่สามารถรับรายได้`);
            }
            return;
        }

        shop.status.pendingRevenue = 0;
        shopDatabase.save();
        player.sendMessage(`§a[Shop] รับรายได้ ${amount} ไดม่อน แล้ว`);
    } catch (error) {
        console.error('[Shop] claimRevenueUI:', error);
    }
}

function countChestItems(container) {
    if (!container) return 0;
    return Array.from({ length: container.size }).filter((_, i) => container.getItem(i)).length;
}
