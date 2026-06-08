import { ChestFormData } from '../../extensions/forms.js';
import shopDatabase from '../data/database.js';
import { getContainer, spawnItemStack } from '../utils/blockUtils.js';
import { formatName, transferItemToInventory, isFormValid } from '../utils/helpers.js';
import { handleFormError } from '../utils/UIUtils.js';
import { manageItems } from './manageItems.js';

function getShopItems(container, prices) {
    return Array.from({ length: container.size })
        .map((_, i) => {
            const item = container.getItem(i);

            if (!item) return null;

            const slotKey = String(i);

            return {
                slotKey,
                slotIndex: i,
                itemId: item.typeId,
                amount: item.amount,
                price: prices[slotKey] ?? 0,
            };
        })
        .filter(Boolean);
}

export function removeItem(player, shop) {
    try {
        const container = getContainer(shop);

        if (!container) {
            player.sendMessage(`§c[Shop] ไม่สามารถเข้าถึงร้านค้าได้`);
            return;
        }

        const items = getShopItems(container, shop.prices || {});

        if (items.length === 0) {
            player.sendMessage(`§c[Shop] ไม่มีสินค้าให้ลบ`);
            return;
        }

        const form = new ChestFormData('large').title('ลบสินค้า').pattern(['xxxxxxxxx', 'x_______x', 'x_______x', 'x_______x', 'x_______x', 'x_______x'], {
            x: {
                itemName: '',
                texture: 'minecraft:red_stained_glass_pane',
                stackAmount: 1,
            },
        });

        const slotMap = {};

        let cursor = 10;

        for (const selectedItem of items) {
            if (cursor >= 53) break;

            while (cursor % 9 === 0 || cursor % 9 === 8) cursor++;

            if (cursor >= 54) break;

            form.button(
                cursor,
                `§c${formatName(selectedItem.itemId)}`,
                [`§7x${selectedItem.amount} | $${selectedItem.price}`, '', '§eคลิกเพื่อดึงคืน'],
                selectedItem.itemId,
                Math.min(selectedItem.amount, 99),
            );

            slotMap[cursor] = selectedItem;

            cursor++;
        }

        form.button(49, 'ย้อนกลับ', [''], 'minecraft:barrier', 1);

        form.show(player)
            .then((res) => {
                if (!isFormValid(player, res)) return;

                if (!player?.isValid) return;

                if (res.selection === 49) {
                    manageItems(player, shop);
                    return;
                }
                const selectedItem = slotMap[res.selection];
                if (selectedItem) confirmRemove(player, shop, selectedItem, container);
            })
            .catch((error) => handleFormError(player, error));
    } catch (error) {
        console.error('[Shop] removeItem:', error);
    }
}

function confirmRemove(player, shop, selectedItem, container) {
    try {
        const { slotKey, slotIndex, itemId, amount } = selectedItem;

        const containerItem = container.getItem(slotIndex);

        if (!containerItem || containerItem.typeId !== itemId || containerItem.amount < amount) {
            player.sendMessage(`§c[Shop] ไม่พบสินค้าในร้าน`);
            return;
        }

        const inventory = player.getComponent('minecraft:inventory')?.container;

        if (!inventory) return;

        const itemStack = container.getItem(slotIndex);

        container.setItem(slotIndex, undefined);

        delete shop.prices[slotKey];
        shopDatabase.save();

        const { returned, lost, remainder } = transferItemToInventory(inventory, itemStack);

        if (returned > 0) {
            player.sendMessage(`§a[Shop] ดึง ${formatName(itemId)} คืน ${returned} ชิ้น`);
        }

        if (lost > 0 && remainder) {
            spawnItemStack(shop, remainder);
            player.sendMessage(`§e[Shop] ช่องเก็บของเต็ม! ${lost} ${formatName(itemId)} ถูกวางบนพื้น`);
        }

        //วนกลับ - แสดงฟอร์มลบสินค้าอีกครั้งเพื่อให้ลบต่อได้
        removeItem(player, shop);
    } catch (error) {
        console.error('[Shop] confirmRemove:', error);
        if (player?.isValid) {
            player.sendMessage(`§c[Shop] เกิดข้อผิดพลาดในการดึงคืนสินค้า`);
        }
    }
}
