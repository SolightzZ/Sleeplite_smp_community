import { ChestFormData } from '../../extensions/forms.js';
import shopDatabase from '../core/database.js';
import blockUtils from '../utils/blockUtils.js';
import helpers from '../utils/helpers.js';
import uiUtils from '../utils/ui.js';
import manageItems from './manageItems.js';

const MENU_BORDER = 'xxxxxxxxx';
const MENU_ROW = 'x_______x';

class RemoveItem {
    removeItem = (player, shop) => {
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
                    return {
                        slotKey,
                        slotIndex: i,
                        itemId: item.typeId,
                        amount: item.amount,
                        price: prices[slotKey] ?? 0,
                    };
                })
                .filter(Boolean);

            if (items.length === 0) {
                player.sendMessage(`§c[Shop] ไม่มีสินค้าให้ลบ`);
                return;
            }

            const chest = new ChestFormData('large');
            chest.title('ลบสินค้า');
            chest.pattern([MENU_BORDER, MENU_ROW, MENU_ROW, MENU_ROW, MENU_ROW, MENU_ROW], {
                x: {
                    itemName: '',
                    texture: 'minecraft:red_stained_glass_pane',
                    stackAmount: 1,
                },
            });

            const slotMap = {};
            let slotCursor = 10;
            for (const entry of items) {
                if (slotCursor >= 53) break;
                while (slotCursor % 9 === 0 || slotCursor % 9 === 8) slotCursor++;
                if (slotCursor >= 54) break;

                chest.button(slotCursor, `§c${helpers.formatName(entry.itemId)}`, [`§7x${entry.amount} | $${entry.price}`, '', '§eคลิกเพื่อดึงคืน'], entry.itemId, Math.min(entry.amount, 99));
                slotMap[slotCursor] = entry;
                slotCursor++;
            }

            chest.button(49, '§7ย้อนกลับ', [''], 'minecraft:barrier', 1);

            uiUtils.showForm(player, chest, 'shop.remove.select', (res) => {
                if (res.canceled) return;
                if (res.selection === 49) {
                    manageItems.manageItems(player, shop);
                    return;
                }
                const entry = slotMap[res.selection];
                if (entry) this.confirmRemove(player, shop, entry, container);
            });
        } catch (error) {
            console.error('[Shop] removeItem:', error);
        }
    };

    confirmRemove = (player, shop, entry, chestContainer) => {
        try {
            const { slotKey, slotIndex, itemId, amount } = entry;

            const chestItem = chestContainer.getItem(slotIndex);
            if (!chestItem || chestItem.typeId !== itemId || chestItem.amount < amount) {
                player.sendMessage(`§c[Shop] ไม่พบสินค้าในร้าน`);
                return;
            }

            const inv = player.getComponent('minecraft:inventory')?.container;
            if (!inv) return;

            const itemStack = chestContainer.getItem(slotIndex);
            chestContainer.setItem(slotIndex, undefined);

            delete shop.prices[slotKey];
            shopDatabase.save();

            const { returned, lost, remainder } = helpers.addItemStack(inv, itemStack);

            if (returned > 0) {
                player.sendMessage(`§a[Shop] ดึง ${helpers.formatName(itemId)} คืน ${returned} ชิ้น`);
            }

            if (lost > 0 && remainder) {
                blockUtils.spawnItemStack(shop, remainder);
                player.sendMessage(`§e[Shop] ช่องเก็บของเต็ม! ${lost} ${helpers.formatName(itemId)} ถูกวางบนพื้น`);
            }
        } catch (error) {
            console.error('[Shop] confirmRemove:', error);
            if (player?.isValid) {
                player.sendMessage(`§c[Shop] เกิดข้อผิดพลาดในการดึงคืนสินค้า`);
            }
        }
    };
}

export default new RemoveItem();
