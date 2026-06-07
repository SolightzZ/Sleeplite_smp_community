import { ActionFormData } from '@minecraft/server-ui';
import shopDatabase from '../data/database.js';
import { getContainer } from '../utils/blockUtils.js';
import { addCurrency, formatThaiTime, isFormValid } from '../utils/helpers.js';
import { handleFormError } from '../utils/UIUtils.js';
import { manageItems } from './manageItems.js';
import { showSettings } from './shopSettings.js';
import { showBuyersList } from './buyersList.js';
import { showSalesHistory } from './salesHistory.js';

function countItems(container) {
    if (!container) return 0;
    return Array.from({ length: container.size }).filter((_, i) => container.getItem(i)).length;
}

export function showInfo(player, shop) {
    try {
        const container = getContainer(shop);

        const itemCount = container ? countItems(container) : 0;

        const salesCount = Object.values(shop.buyers || {}).reduce((sum, b) => sum + (b.buyCount || 0), 0);

        const revenue = Object.values(shop.buyers || {}).reduce((sum, b) => sum + (b.spent || 0), 0);

        const pending = shop.status.pendingRevenue ?? 0;

        const uniqueBuyers = Object.keys(shop.buyers || {}).length;

        const form = new ActionFormData()
            .title(`${shop.owner.playerName}'s Shop`)

            .body(
                `§fรายได้รวม: §e${revenue} $\n` +
                    `§fรายได้รอรับ: §e${pending} $\n` +
                    `§fยอดขาย: §f${salesCount} ครั้ง\n` +
                    `§fสินค้าในร้าน: §e${itemCount} รายการ\n` +
                    `§fผู้ซื้อ: §f${uniqueBuyers} คน\n\n` +
                    `§fสร้างเมื่อ: ${formatThaiTime(shop.createdAt)}\n` +
                    `§fอัปเดตล่าสุด: ${formatThaiTime(shop.updatedAt)}\n` +
                    `§fเข้าใช้ล่าสุด: ${formatThaiTime(shop.status.lastAccess)}\n` +
                    `§fขายล่าสุด: ${formatThaiTime(shop.lastSale)}`,
            )

            .button('รับรายได้', 'textures/items/diamond')

            .button('ตั้งค่า', 'textures/ui/settings_pause_menu_icon.png')

            .button('ผู้ซื้อ', 'textures/ui/icon_multiplayer.png')

            .button('ประวัติการขาย', 'textures/ui/icons/icon_deals.png')

            .button('ย้อนกลับ');

        form.show(player)
            .then((res) => {
                if (!isFormValid(player, res)) return;
                if (!player?.isValid()) return;
                switch (res.selection) {
                    case 0:
                        collectRevenue(player, shop);
                        break;
                    case 1:
                        showSettings(player, shop);
                        break;
                    case 2:
                        showBuyersList(player, shop);
                        break;
                    case 3:
                        showSalesHistory(player, shop);
                        break;
                    case 4:
                        manageItems(player, shop);
                        break;
                }
            })
            .catch((error) => handleFormError(player, error));
    } catch (error) {
        console.error('[Shop] showInfo:', error);
    }
}

function collectRevenue(player, shop) {
    try {
        const amount = shop.status.pendingRevenue ?? 0;

        if (amount <= 0) {
            player.sendMessage(`§c[Shop] ไม่มีรายได้รอรับ`);
            showInfo(player, shop);
            return;
        }

        const inventory = player.getComponent('minecraft:inventory')?.container;

        if (!inventory) return;

        const overflowAmount = addCurrency(inventory, amount);

        if (overflowAmount > 0) {
            const claimedAmount = amount - overflowAmount;

            shop.status.pendingRevenue = overflowAmount;

            shopDatabase.save();

            if (claimedAmount > 0) {
                player.sendMessage(`§c[Shop] ช่องเก็บของเต็ม! ได้รับเพียง ${claimedAmount} ไดม่อน (คงค้าง ${overflowAmount})`);
            } else {
                player.sendMessage(`§c[Shop] ช่องเก็บของเต็ม! ไม่สามารถรับรายได้`);
            }
            return;
        }

        shop.status.pendingRevenue = 0;

        shopDatabase.save();

        player.sendMessage(`§a[Shop] รับรายได้ ${amount} ไดม่อน แล้ว`);
    } catch (error) {
        console.error('[Shop] collectRevenue:', error);
    }
}
