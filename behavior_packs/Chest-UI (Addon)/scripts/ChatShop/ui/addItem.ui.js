import { ModalFormData } from '@minecraft/server-ui';
import { ChestFormData } from '../../extensions/forms.js';
import { CONFIG } from '../config.js';
import { depositItems, depositMultipleItems } from '../core/depositItems.js';
import shopDatabase from '../data/database.js';
import { formatName, isFormValid } from '../utils/helpers.js';
import { handleFormError } from '../utils/UIUtils.js';
import { addItem } from './addItem.js';
import { manageItems } from './manageItems.js';

function addInventoryRows(form, slotMap, inventory) {
    Array.from({ length: 27 }, (_, i) => i + 9).forEach((i) => {
        const item = inventory.getItem(i);

        if (!item) return;

        form.button(i, `§f${formatName(item.typeId)}`, [`§7x${item.amount}`, '', '§eคลิกเลือก'], item.typeId, Math.min(item.amount, 99));

        slotMap[i] = i;
    });
    Array.from({ length: 9 }).forEach((_, i) => {
        const item = inventory.getItem(i);

        if (!item) return;

        const uiSlot = 45 + i;

        form.button(uiSlot, `§f${formatName(item.typeId)}`, [`§7x${item.amount}`, '', '§eคลิกเลือก'], item.typeId, Math.min(item.amount, 99));

        slotMap[uiSlot] = i;
    });
}

export function showAddForm(player, shop, container, emptySlots) {
    try {
        const inventory = player.getComponent('minecraft:inventory')?.container;

        if (!inventory) {
            player.sendMessage(`§c[Shop] ไม่สามารถเข้าถึง Inventory ได้`);
            return;
        }

        const form = new ChestFormData('large').title('เลือกสินค้าจาก Inventory').pattern(['xxxxxxxxx', '_________', '_________', '_________', 'xxxxxxxxx', '_________'], {
            x: {
                itemName: '',
                texture: 'minecraft:gray_stained_glass_pane',
                stackAmount: 1,
            },
        });

        const slotMap = {};

        addInventoryRows(form, slotMap, inventory);

        form.button(40, 'ยกเลิก', [''], 'minecraft:barrier', 1);

        form.show(player)
            .then((res1) => {
                if (!isFormValid(player, res1)) return;
                if (!player?.isValid) return;
                if (res1.selection === 40) {
                    manageItems(player, shop);
                    return;
                }

                const inventorySlot = slotMap[res1.selection];

                if (inventorySlot === undefined) return;

                showPriceForm(player, shop, container, emptySlots, inventorySlot, inventory);
            })
            .catch((error) => handleFormError(player, error));
    } catch (error) {
        console.error('[Shop] showAddForm:', error);
    }
}

function showPriceForm(player, shop, container, emptySlots, inventorySlot, inventory) {
    try {
        const selectedItem = inventory.getItem(inventorySlot);

        if (!selectedItem) return;

        const itemId = selectedItem.typeId;

        const itemName = formatName(itemId);

        const totalCount = Array.from({ length: inventory.size }, (_, i) => inventory.getItem(i)).reduce((sum, stack) => {
            if (!stack || stack.typeId !== itemId) return sum;

            return sum + stack.amount;
        }, 0);

        if (totalCount <= 0) return;

        const presetAmounts = [1, 4, 8, 16, 32, 64];

        const validAmounts = presetAmounts.filter((a) => a <= totalCount);

        validAmounts.push(totalCount);

        const form = new ChestFormData('large').title(`จำนวน ${itemName}`);

        const slotMap = {};

        let cursor = 10;

        for (const amount of validAmounts) {
            if (cursor >= 53) break;

            while (cursor % 9 === 0 || cursor % 9 === 8) cursor++;

            if (cursor >= 54) break;

            const isMax = amount === totalCount;

            const label = isMax ? `§eทั้งหมด (${amount})` : `§f${amount}`;

            form.button(cursor, label, [`§7${itemName}`, '', '§eเลือก'], itemId, Math.min(amount, 99));

            slotMap[cursor] = amount;

            cursor++;
        }

        form.button(49, 'ย้อนกลับ', [''], 'minecraft:barrier', 1);

        form.show(player)
            .then((res) => {
                if (!isFormValid(player, res)) return;
                if (!player?.isValid) return;
                if (res.selection === 49) {
                    showAddForm(player, shop, container, emptySlots);
                    return;
                }

                const amount = slotMap[res.selection];

                if (!amount) return;

                showPriceModal(player, shop, container, emptySlots, inventorySlot, inventory, amount, itemId);
            })
            .catch((error) => handleFormError(player, error));
    } catch (error) {
        console.error('[Shop] showPriceForm:', error);
    }
}

function showPriceModal(player, shop, container, emptySlots, inventorySlot, inventory, amount, itemId) {
    try {
        const MAX = inventory.getItem(inventorySlot)?.maxAmount || 64;

        if (amount > MAX) {
            bulkDepositFlow(player, shop, container, emptySlots, inventorySlot, inventory, amount, itemId, MAX);
            return;
        }

        const form = new ModalFormData();
        form.title('ตั้งราคา');
        form.slider('ราคา ($)', CONFIG.minPrice, CONFIG.maxPrice, 1, 1);

        form.show(player)
            .then((res) => {
                if (!isFormValid(player, res)) return;
                if (!player?.isValid) return;

                const price = Number(res.formValues[0]);

                if (price < CONFIG.minPrice || price > CONFIG.maxPrice) {
                    player.sendMessage(`§c[Shop] กรุณากรอกราคาให้ถูกต้อง`);
                    showPriceForm(player, shop, container, emptySlots, inventorySlot, inventory);
                    return;
                }

                const inventoryTotal = Array.from({ length: inventory.size }, (_, i) => inventory.getItem(i)).reduce((sum, stack) => {
                    if (!stack || stack.typeId !== itemId) return sum;

                    return sum + stack.amount;
                }, 0);

                if (inventoryTotal < amount) {
                    player.sendMessage(`§c[Shop] ของใน Inventory ไม่พอ (ต้องการ ${amount} มี ${inventoryTotal})`);
                    showAddForm(player, shop, container, emptySlots);
                    return;
                }

                const usedNewSlot = depositItems(player, inventory, inventorySlot, container, emptySlots[0], amount, shop, price);

                if (usedNewSlot) {
                    const slotKey = String(emptySlots[0]);
                    shop.prices[slotKey] = price;
                }

                shopDatabase.save();

                player.sendMessage(`§a[Shop] เพิ่มสินค้าสำเร็จ! (${amount} ${formatName(itemId)}${usedNewSlot ? ` ราคา ${price} $` : ''})`);

                addItem(player, shop);
            })
            .catch((error) => handleFormError(player, error));
    } catch (error) {
        console.error('[Shop] showPriceModal:', error);
    }
}

function bulkDepositFlow(player, shop, container, emptySlots, inventorySlot, inventory, amount, itemId, maxPerSlot) {
    if (emptySlots.length === 0) {
        player.sendMessage(`§c[Shop] กล่องร้านค้าเต็ม`);
        return;
    }

    const form = new ModalFormData();

    form.title('ตั้งราคา (ทั้งหมด)');

    form.slider('ราคาต่อช่อง ($)', CONFIG.minPrice, CONFIG.maxPrice, 1, 1);

    form.show(player)

        .then((res) => {
            if (!isFormValid(player, res)) return;
            if (!player?.isValid) return;

            const price = Number(res.formValues[0]);

            if (price < CONFIG.minPrice || price > CONFIG.maxPrice) {
                player.sendMessage(`§c[Shop] กรุณากรอกราคาให้ถูกต้อง`);
                bulkDepositFlow(player, shop, container, emptySlots, inventorySlot, inventory, amount, itemId, maxPerSlot);
                return;
            }

            const inventoryTotal = Array.from({ length: inventory.size }, (_, i) => inventory.getItem(i)).reduce((sum, stack) => {
                if (!stack || stack.typeId !== itemId) return sum;

                return sum + stack.amount;
            }, 0);

            if (inventoryTotal < amount) {
                player.sendMessage(`§c[Shop] ของใน Inventory ไม่พอ (ต้องการ ${amount} มี ${inventoryTotal})`);

                showAddForm(player, shop, container, emptySlots);

                return;
            }

            const filled = depositMultipleItems(player, inventory, inventorySlot, container, emptySlots, amount, shop, price);

            shopDatabase.save();

            player.sendMessage(`§a[Shop] เพิ่มสินค้าสำเร็จ! (${amount} ${formatName(itemId)} ราคา ${price} $ จำนวน ${filled} ช่อง)`);

            addItem(player, shop);
        })
        .catch((error) => handleFormError(player, error));
}
