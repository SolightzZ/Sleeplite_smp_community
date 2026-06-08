import { MessageFormData } from '@minecraft/server-ui';
import { ChestFormData } from '../../extensions/forms.js';
import { buy } from '../core/buyExecutor.js';
import { getContainer } from '../utils/blockUtils.js';
import { formatName, isFormValid } from '../utils/helpers.js';
import { handleFormError } from '../utils/UIUtils.js';
import { getAvailableItems, getValidAmounts, calculateTotalPrice } from './buyMenuUtils.js';

export function showBuyMenu(player, shop) {
    try {
        const container = getContainer(shop);

        if (!container) {
            player.sendMessage('§c[Shop] ไม่สามารถเข้าถึงร้านค้าได้');
            return;
        }

        const available = getAvailableItems(container, shop.prices || {});

        if (available.length === 0) {
            player.sendMessage('§c[Shop] ร้านค้ายังไม่มีสินค้า');
            return;
        }

        const form = new ChestFormData('large').title(`${shop.owner.playerName}'s Shop`).pattern(['xxxxxxxxx', 'x_______x', 'x_______x', 'x_______x', 'x_______x', 'x_______x'], {
            x: {
                itemName: '',
                texture: 'minecraft:gray_stained_glass_pane',
                stackAmount: 1,
            },
        });

        const slotMap = {};

        let cursor = 10;

        for (const selectedItem of available) {
            if (cursor >= 53) break;

            while (cursor % 9 === 0 || cursor % 9 === 8) cursor++;

            if (cursor >= 54) break;

            form.button(
                cursor,
                `§f...${formatName(selectedItem.itemId)}`,
                [`§7$${selectedItem.price} ต่อครั้ง`, `§7Stock: §b${selectedItem.amount}`, '', '§eคลิกเพื่อซื้อ'],
                selectedItem.itemId,
                Math.min(selectedItem.amount, 99),
            );

            slotMap[cursor] = selectedItem;

            cursor++;
        }

        form.button(49, '§7ปิด', [''], 'minecraft:barrier', 1);

        form.show(player)
            .then((res) => {
                if (!isFormValid(player, res)) return;

                if (!player?.isValid) return;

                if (res.selection === 49) return;

                const selectedItem = slotMap[res.selection];

                if (!selectedItem) return;

                showBuyAmount(player, shop, selectedItem);
            })
            .catch((error) => handleFormError(player, error));
    } catch (error) {
        console.error('[Shop] showBuyMenu:', error);
    }
}

function showBuyAmount(player, shop, selectedItem) {
    try {
        const { itemId, amount: maxAmount } = selectedItem;

        const validAmounts = getValidAmounts(maxAmount);

        const form = new ChestFormData('large').title(`§l${formatName(itemId)}`);

        const slotMap = {};

        let cursor = 10;

        for (const buyAmount of validAmounts) {
            if (cursor >= 53) break;

            while (cursor % 9 === 0 || cursor % 9 === 8) cursor++;

            if (cursor >= 54) break;

            const totalPrice = calculateTotalPrice(selectedItem.price, buyAmount, maxAmount);

            const label = buyAmount === maxAmount ? `§eทั้งหมด (${buyAmount})` : `§f${buyAmount}`;

            form.button(cursor, label, [`§7${formatName(itemId)}`, '', `§e${totalPrice} $`], itemId, Math.min(buyAmount, 99));

            slotMap[cursor] = { buyAmount, totalPrice };

            cursor++;
        }

        form.button(49, 'ย้อนกลับ', [''], 'minecraft:barrier', 1);

        form.show(player)
            .then((res) => {
                if (!isFormValid(player, res)) return;

                if (!player?.isValid) return;

                if (res.selection === 49) {
                    showBuyMenu(player, shop);
                    return;
                }

                const selected = slotMap[res.selection];

                if (!selected) return;

                confirmBuy(player, shop, selectedItem, selected.buyAmount, selected.totalPrice);
            })
            .catch((error) => handleFormError(player, error));
    } catch (error) {
        console.error('[Shop] showBuyAmount:', error);
    }
}

function confirmBuy(player, shop, selectedItem, buyAmount, totalPrice) {
    try {
        const { itemId } = selectedItem;

        new MessageFormData()

            .title('ยืนยันการซื้อ')

            .body(`§7สินค้า: §f${formatName(itemId)}\n` + `§7จำนวน: §f${buyAmount}\n` + `§7ราคา: §e${totalPrice} $\n\n` + `§6ยืนยันการซื้อ?`)

            .button1('ซื้อ')

            .button2('ยกเลิก')

            .show(player)

            .then((res) => {
                if (!isFormValid(player, res)) return;

                if (!player?.isValid) return;

                if (res.selection !== 0) return;

                buy(player, shop, {
                    ...selectedItem,
                    amount: buyAmount,
                    totalPrice,
                });
            })
            .catch((error) => handleFormError(player, error));
    } catch (error) {
        console.error('[Shop] confirmBuy:', error);
    }
}
