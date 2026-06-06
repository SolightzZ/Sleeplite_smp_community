import { world, ItemStack } from '@minecraft/server';
import { ModalFormData } from '@minecraft/server-ui';
import { ChestFormData } from '../../extensions/forms.js';
import { CONFIG } from '../config.js';
import shopDatabase from '../core/database.js';
import blockUtils from '../utils/blockUtils.js';
import helpers from '../utils/helpers.js';
import uiUtils from '../utils/ui.js';
import { manageItems } from './manageItems.js';

export function addItem(player, shop) {
    try {
        const container = blockUtils.getContainer(shop);
        if (!container) {
            player.sendMessage(`§c[Shop] ไม่สามารถเข้าถึงร้านค้าได้`);
            return;
        }

        const freeSlot = Array.from({ length: container.size }).findIndex(
            (_, i) => !container.getItem(i),
        );

        if (freeSlot === -1) {
            player.sendMessage(`§c[Shop] กล่องร้านค้าเต็ม`);
            return;
        }

        showAddForm(player, shop, container, freeSlot);
    } catch (error) {
        console.error('[Shop] addItem:', error);
    }
}

function showAddForm(player, shop, chestContainer, slotIndex) {
    try {
        const inv = player.getComponent('minecraft:inventory')?.container;
        if (!inv) {
            player.sendMessage(`§c[Shop] ไม่สามารถเข้าถึง Inventory ได้`);
            return;
        }

        const chest = new ChestFormData('large')
            .title('เลือกสินค้าจาก Inventory')
            .pattern(
                ['xxxxxxxxx', '_________', '_________', '_________', 'xxxxxxxxx', '_________'],
                {
                    x: {
                        itemName: '',
                        texture: 'minecraft:gray_stained_glass_pane',
                        stackAmount: 1,
                    },
                },
            );

        const slotMap = {};

        Array.from({ length: 28 }, (_, i) => i + 9).forEach((i) => {
            const item = inv.getItem(i);
            if (!item) return;

            chest.button(
                i,
                `§f${helpers.formatName(item.typeId)}`,
                [`§7x${item.amount}`, '', '§eคลิกเลือก'],
                item.typeId,
                Math.min(item.amount, 99),
            );
            slotMap[i] = i;
        });

        Array.from({ length: 9 }).forEach((_, i) => {
            const item = inv.getItem(i);
            if (!item) return;

            const chestSlot = 45 + i;
            chest.button(
                chestSlot,
                `§f${helpers.formatName(item.typeId)}`,
                [`§7x${item.amount}`, '', '§eคลิกเลือก'],
                item.typeId,
                Math.min(item.amount, 99),
            );
            slotMap[chestSlot] = i;
        });

        chest.button(40, '§7ยกเลิก', [''], 'minecraft:barrier', 1);

        uiUtils.showForm(player, chest, 'shop.add.pick', (res) => {
            if (res.canceled) {
                manageItems(player, shop);
                return;
            }
            if (res.selection === 40) {
                manageItems(player, shop);
                return;
            }

            const invSlot = slotMap[res.selection];
            if (invSlot === undefined) return;

            const selectedItem = inv.getItem(invSlot);
            if (!selectedItem) return;

            const slotItemCount = selectedItem.amount;

            const form = new ModalFormData();
            form.title('เพิ่มสินค้า');
            form.textField('Item ID', 'minecraft:iron_ingot', selectedItem.typeId);
            form.slider('จำนวน (Items ทั้งหมดในช่อง)', 1, slotItemCount, 1, slotItemCount);
            form.slider('ราคา ($)', CONFIG.minPrice, CONFIG.maxPrice, 1, 1);

            uiUtils.showForm(player, form, 'shop.add.form', (res) => {
                if (res.canceled) {
                    showAddForm(player, shop, chestContainer, slotIndex);
                    return;
                }

                const inputItemId = String(res.formValues[0] ?? '').trim();
                const amount = Number(res.formValues[1]);
                const price = Number(res.formValues[2]);

                if (!inputItemId || amount < 1 || price < CONFIG.minPrice) {
                    player.sendMessage(`§c[Shop] กรุณากรอกข้อมูลให้ถูกต้อง`);
                    showAddForm(player, shop, chestContainer, slotIndex);
                    return;
                }

                try {
                    new ItemStack(inputItemId, 1);
                } catch {
                    player.sendMessage(`§c[Shop] Item ID "${inputItemId}" ไม่ถูกต้อง`);
                    showAddForm(player, shop, chestContainer, slotIndex);
                    return;
                }

                const currentItem = inv.getItem(invSlot);
                if (
                    !currentItem ||
                    currentItem.typeId !== inputItemId ||
                    currentItem.amount < amount
                ) {
                    player.sendMessage(`§c[Shop] ของใน Inventory ไม่พอ (ต้องการ ${amount})`);
                    showAddForm(player, shop, chestContainer, slotIndex);
                    return;
                }

                const itemStack = inv.getItem(invSlot);
                inv.setItem(invSlot, undefined);

                if (itemStack.amount > amount) {
                    chestContainer.setItem(slotIndex, itemStack);
                    const chestStack = chestContainer.getItem(slotIndex);
                    chestStack.amount = amount;
                    chestContainer.setItem(slotIndex, chestStack);

                    const extraAmount = itemStack.amount - amount;
                    const remain = inv.addItem(new ItemStack(itemStack.typeId, extraAmount));
                    if (remain) {
                        const dim = world.getDimension(shop.dimension);
                        if (dim) {
                            dim.spawnItem(remain, {
                                x: shop.location.x + 0.5,
                                y: shop.location.y + 0.5,
                                z: shop.location.z + 0.5,
                            });
                        }
                    }

                    player.sendMessage(
                        `§e[Shop] ขาย ${amount} ชิ้น (NBT ถูกเก็บไว้) ส่วนเกิน ${extraAmount} ชิ้นถูกส่งคืน`,
                    );
                } else {
                    chestContainer.setItem(slotIndex, itemStack);
                }

                const slotKey = String(slotIndex);
                shop.prices[slotKey] = price;
                shopDatabase.save();

                player.sendMessage(
                    `§a[Shop] เพิ่มสินค้าสำเร็จ! (${amount} ${helpers.formatName(inputItemId)} ราคา ${price} $)`,
                );

                addItem(player, shop);
            });
        });
    } catch (error) {
        console.error('[Shop] showAddForm:', error);
    }
}
