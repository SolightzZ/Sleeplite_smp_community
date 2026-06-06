import { ModalFormData } from '@minecraft/server-ui';
import { ChestFormData } from '../../extensions/forms.js';
import { CONFIG } from '../config.js';
import shopDatabase from '../core/database.js';
import blockUtils from '../utils/blockUtils.js';
import helpers from '../utils/helpers.js';
import uiUtils from '../utils/ui.js';
import manageItems from './manageItems.js';

const MENU_BORDER = 'xxxxxxxxx';
const MENU_ROW = 'x_______x';

class EditPrice {
    editPrice = (player, shop) => {
        try {
            const container = blockUtils.getContainer(shop);
            if (!container) {
                player.sendMessage(`§c[Shop] ไม่สามารถเข้าถึงร้านค้าได้`);
                return;
            }

            const prices = shop.prices || {};
            const items = Array.from({ length: container.size })
                .map((_, i) => {
                    const item = container.getItem(i);
                    if (!item) return null;

                    const slotKey = `slot_${i}`;
                    const price = prices[slotKey];
                    if (price === undefined) return null;

                    return {
                        slotKey,
                        slotIndex: i,
                        itemId: item.typeId,
                        amount: item.amount,
                        price,
                    };
                })
                .filter(Boolean);

            if (items.length === 0) {
                player.sendMessage(`§c[Shop] ไม่มีสินค้าในร้าน`);
                return;
            }

            const chest = new ChestFormData('large');
            chest.title('แก้ไขราคา');
            chest.pattern([MENU_BORDER, MENU_ROW, MENU_ROW, MENU_ROW, MENU_ROW, MENU_ROW], {
                x: {
                    itemName: '',
                    texture: 'minecraft:gray_stained_glass_pane',
                    stackAmount: 1,
                },
            });

            const slotMap = {};
            let slotCursor = 10;
            for (const entry of items) {
                if (slotCursor >= 53) break;
                while (slotCursor % 9 === 0 || slotCursor % 9 === 8) slotCursor++;
                if (slotCursor >= 54) break;

                chest.button(
                    slotCursor,
                    `§f...${helpers.formatName(entry.itemId)}`,
                    [`§7$${entry.price} | จำนวน: §b${entry.amount}`, '', '§eคลิกเพื่อแก้ไขราคา'],
                    entry.itemId,
                    Math.min(entry.amount, 99),
                );
                slotMap[slotCursor] = entry;
                slotCursor++;
            }

            chest.button(49, '§7ย้อนกลับ', [''], 'minecraft:barrier', 1);

            uiUtils.showForm(player, chest, 'shop.edit.select', (res) => {
                if (res.canceled) return;
                if (res.selection === 49) {
                    manageItems.manageItems(player, shop);
                    return;
                }
                const entry = slotMap[res.selection];
                if (entry) this.showEditForm(player, shop, entry);
            });
        } catch (error) {
            console.error('[Shop] editPrice:', error);
        }
    };

    showEditForm = (player, shop, entry) => {
        try {
            const { slotKey, price } = entry;

            const form = new ModalFormData();
            form.title('แก้ไขราคา');
            form.slider('ราคา ($)', CONFIG.minPrice, CONFIG.maxPrice, 1, price);

            uiUtils.showForm(player, form, 'shop.edit.price', (res) => {
                if (res.canceled) return;

                const newPrice = Number(res.formValues[0]);
                if (newPrice < CONFIG.minPrice) {
                    player.sendMessage(`§c[Shop] ราคาต้องอย่างน้อย ${CONFIG.minPrice}`);
                    return;
                }

                shop.prices[slotKey] = newPrice;
                shopDatabase.save();

                player.sendMessage(`§a[Shop] แก้ไขราคา ${helpers.formatName(entry.itemId)} → ${newPrice} $ แล้ว`);
            });
        } catch (error) {
            console.error('[Shop] showEditForm:', error);
        }
    };
}

export default new EditPrice();
