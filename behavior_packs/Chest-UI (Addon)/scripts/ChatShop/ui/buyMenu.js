import { ChestFormData } from '../../extensions/forms.js';
import buyExecutor from '../core/buyExecutor.js';
import blockUtils from '../utils/blockUtils.js';
import helpers from '../utils/helpers.js';
import uiUtils from '../utils/ui.js';

const SHOP_BORDER = 'xxxxxxxxx';
const SHOP_ROW = 'x_______x';

class BuyMenu {
    showBuyMenu = (player, shop) => {
        try {
            const container = blockUtils.getContainer(shop);
            if (!container) {
                player.sendMessage('§c[Shop] ไม่สามารถเข้าถึงร้านค้าได้');
                return;
            }

            const prices = shop.prices || {};
            const available = Array.from({ length: container.size })
                .map((_, slotIndex) => {
                    const item = container.getItem(slotIndex);
                    if (!item) return null;

                    const slotKey = `slot_${slotIndex}`;
                    const price = prices[slotKey];
                    if (price === undefined || price === null) return null;

                    return {
                        slotKey,
                        slotIndex,
                        itemId: item.typeId,
                        amount: item.amount,
                        price,
                    };
                })
                .filter(Boolean);

            if (available.length === 0) {
                player.sendMessage('§c[Shop] ร้านค้ายังไม่มีสินค้า');
                return;
            }

            const chest = new ChestFormData('large');
            chest.title(`${shop.owner.playerName}'s Shop`);
            chest.pattern([SHOP_BORDER, SHOP_ROW, SHOP_ROW, SHOP_ROW, SHOP_ROW, SHOP_ROW], {
                x: {
                    itemName: '',
                    texture: 'minecraft:gray_stained_glass_pane',
                    stackAmount: 1,
                },
            });

            const slotMap = {};
            let slotCursor = 10;
            for (const entry of available) {
                if (slotCursor >= 53) break;

                while (slotCursor % 9 === 0 || slotCursor % 9 === 8) slotCursor++;
                if (slotCursor >= 54) break;

                chest.button(
                    slotCursor,
                    `§f...${helpers.formatName(entry.itemId)}`,
                    [`§7$${entry.price} ต่อครั้ง`, `§7Stock: §b${entry.amount}`, '', '§eคลิกเพื่อซื้อ'],
                    entry.itemId,
                    Math.min(entry.amount, 99),
                );
                slotMap[slotCursor] = entry;
                slotCursor++;
            }

            chest.button(49, '§7ปิด', [''], 'minecraft:barrier', 1);

            uiUtils.showForm(player, chest, 'buy.list', (res) => {
                if (res.canceled) return;
                if (res.selection === 49) return;

                const entry = slotMap[res.selection];
                if (!entry) return;

                this.confirmBuy(player, shop, entry);
            });
        } catch (error) {
            console.error('[Shop] showBuyMenu:', error);
        }
    };

    confirmBuy = (player, shop, entry) => {
        try {
            const { itemId, amount, price } = entry;

            uiUtils.showMessage(
                player,
                {
                    title: 'ยืนยันการซื้อ',
                    body: `§7สินค้า: §f${helpers.formatName(itemId)}\n` + `§7จำนวน: §f${amount}\n` + `§7ราคา: §e${price} $\n\n` + `§6ยืนยันการซื้อ?`,
                    btn1: '§aซื้อ',
                    btn2: '§cยกเลิก',
                    source: 'buy.confirm',
                },
                (res) => {
                    if (res.canceled || res.selection !== 0) return;
                    buyExecutor.executeBuy(player, shop, entry);
                },
            );
        } catch (error) {
            console.error('[Shop] confirmBuy:', error);
        }
    };
}

export default new BuyMenu();
