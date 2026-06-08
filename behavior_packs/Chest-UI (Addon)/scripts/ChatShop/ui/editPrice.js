import { ModalFormData } from '@minecraft/server-ui';
import { ChestFormData } from '../../extensions/forms.js';
import { CONFIG } from '../config.js';
import shopDatabase from '../data/database.js';
import { getContainer, spawnItemStack } from '../utils/blockUtils.js';
import { formatName, isFormValid } from '../utils/helpers.js';
import { handleFormError } from '../utils/UIUtils.js';
import { manageItems } from './manageItems.js';

function getPricedItems(container, prices) {
    return Array.from({ length: container.size })
        .map((_, i) => {
            const item = container.getItem(i);

            if (!item) return null;

            const slotKey = String(i);

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
}

export function editPrice(player, shop) {
    try {
        const container = getContainer(shop);

        if (!container) {
            player.sendMessage(`§c[Shop] ไม่สามารถเข้าถึงร้านค้าได้`);
            return;
        }

        const items = getPricedItems(container, shop.prices || {});

        if (items.length === 0) {
            player.sendMessage(`§c[Shop] ไม่มีสินค้าในร้าน`);
            return;
        }

        const form = new ChestFormData('large').title('แก้ไขสินค้า').pattern(['xxxxxxxxx', 'x_______x', 'x_______x', 'x_______x', 'x_______x', 'x_______x'], {
            x: {
                itemName: '',
                texture: 'minecraft:gray_stained_glass_pane',
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
                `§f...${formatName(selectedItem.itemId)}`,
                [`§7$${selectedItem.price} | จำนวน: §b${selectedItem.amount}`, '', '§eคลิกเพื่อแก้ไข'],
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

                if (selectedItem) showEditForm(player, shop, selectedItem);
            })
            .catch((error) => handleFormError(player, error));
    } catch (error) {
        console.error('[Shop] editPrice:', error);
    }
}

function showEditForm(player, shop, selectedItem) {
    try {
        const { slotKey, slotIndex, itemId, amount: currentAmount, price: currentPrice } = selectedItem;

        const container = getContainer(shop);

        if (!container) {
            player.sendMessage(`§c[Shop] ไม่สามารถเข้าถึงร้านค้าได้`);
            return;
        }

        const slotItem = container.getItem(slotIndex);

        if (!slotItem || slotItem.typeId !== itemId) {
            player.sendMessage(`§c[Shop] ไม่พบสินค้าในร้าน`);
            return;
        }

        const maxStackSize = slotItem.maxAmount || 64;

        const form = new ModalFormData();

        form.title('แก้ไขราคาและจำนวน');

        form.slider('ราคา ($)', CONFIG.minPrice, CONFIG.maxPrice, 1, currentPrice);

        form.slider('จำนวน', 0, maxStackSize, 1, currentAmount);

        form.show(player)
            .then((res) => {
                if (!isFormValid(player, res)) return;
                if (!player?.isValid) return;

                const newPrice = Number(res.formValues[0]);
                const newAmount = Number(res.formValues[1]);

                if (newPrice < CONFIG.minPrice || newPrice > CONFIG.maxPrice) {
                    player.sendMessage(`§c[Shop] ราคาต้องอยู่ระหว่าง ${CONFIG.minPrice}-${CONFIG.maxPrice}`);
                    return;
                }

                const container = getContainer(shop);
                if (!container) {
                    player.sendMessage(`§c[Shop] ไม่สามารถเข้าถึงร้านค้าได้`);
                    return;
                }

                const slotItem = container.getItem(slotIndex);
                if (!slotItem || slotItem.typeId !== itemId || slotItem.amount < currentAmount) {
                    player.sendMessage(`§c[Shop] ไม่พบสินค้าในร้าน`);
                    return;
                }

                //Case1 - ลบสินค้าทิ้งทั้งหมด
                if (newAmount === 0) {
                    container.setItem(slotIndex, undefined);
                    delete shop.prices[slotKey];
                    shopDatabase.save();

                    slotItem.amount = currentAmount;
                    const inv = player.getComponent('minecraft:inventory')?.container;
                    if (inv) {
                        const r = inv.addItem(slotItem);
                        if (r) {
                            spawnItemStack(shop, r);
                        }
                    }

                    player.sendMessage(`§a[Shop] ลบ ${formatName(itemId)} และคืน ${currentAmount} ชิ้นแล้ว`);
                    return;
                }

                //Case2 - ลดจำนวน คืนส่วนเกินให้ผู้เล่น
                if (newAmount < currentAmount) {
                    const excess = currentAmount - newAmount;
                    slotItem.amount = newAmount;
                    container.setItem(slotIndex, slotItem);

                    slotItem.amount = excess;
                    const inv = player.getComponent('minecraft:inventory')?.container;
                    if (inv) {
                        const r = inv.addItem(slotItem);
                        if (r) {
                            spawnItemStack(shop, r);
                        }
                    }

                    shop.prices[slotKey] = newPrice;
                    shopDatabase.save();

                    player.sendMessage(`§a[Shop] แก้ไข ${formatName(itemId)} → ${newAmount} ชิ้น ราคา ${newPrice} $`);
                    editPrice(player, shop);
                    return;
                }

                //Case3 - เพิ่มจำนวน ดึงสินค้าจาก Inventory ผู้เล่น
                if (newAmount > currentAmount) {
                    const currentSlotAmount = slotItem.amount;
                    const desiredTotal = Math.min(newAmount, maxStackSize);
                    const needed = desiredTotal - currentSlotAmount;

                    if (needed <= 0) {
                        player.sendMessage(`§c[Shop] ช่องนี้มีสินค้าเพียงพอแล้ว`);
                        return;
                    }

                    const space = maxStackSize - currentSlotAmount;
                    const toAdd = Math.min(needed, space);

                    const inventory = player.getComponent('minecraft:inventory')?.container;
                    if (!inventory) return;

                    let collected = 0;
                    for (let i = 0; i < inventory.size; i++) {
                        if (collected >= toAdd) break;
                        const stack = inventory.getItem(i);
                        if (!stack || stack.typeId !== itemId) continue;

                        const take = Math.min(toAdd - collected, stack.amount);
                        collected += take;

                        if (take >= stack.amount) {
                            inventory.setItem(i, undefined);
                        } else {
                            stack.amount -= take;
                            inventory.setItem(i, stack);
                        }
                    }

                    if (collected === 0) {
                        player.sendMessage(`§c[Shop] คุณไม่มี ${formatName(itemId)} ใน Inventory`);
                        return;
                    }

                    slotItem.amount = currentSlotAmount + collected;
                    container.setItem(slotIndex, slotItem);

                    shop.prices[slotKey] = newPrice;
                    shopDatabase.save();

                    player.sendMessage(`§a[Shop] เพิ่ม ${formatName(itemId)} จำนวน ${collected} ชิ้น (รวม ${currentSlotAmount + collected} ชิ้น ราคา ${newPrice} $)`);
                    editPrice(player, shop);
                    return;
                }
            })
            .catch((error) => handleFormError(player, error));
    } catch (error) {
        console.error('[Shop] showEditForm:', error);
    }
}
