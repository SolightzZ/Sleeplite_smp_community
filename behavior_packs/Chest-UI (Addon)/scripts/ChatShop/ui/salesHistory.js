import { ActionFormData, MessageFormData } from '@minecraft/server-ui';
import { formatName, formatThaiTime, isFormValid } from '../utils/helpers.js';
import { handleFormError } from '../utils/UIUtils.js';
import { showInfo } from './shopInfo.js';
import { processSalesHistory, buildSalesHistoryBody, buildSaleButtonDesc } from './salesHistoryData.js';

export function showSalesHistory(player, shop, onBack) {
    try {
        const history = shop.salesHistory || [];

        const { sorted, totals } = processSalesHistory(history);

        if (history.length === 0) {
            player.sendMessage(`§c[Shop] ไม่มีประวัติการขาย`);

            if (typeof onBack === 'function') {
                onBack(player, shop);
            } else {
                showInfo(player, shop);
            }
            return;
        }

        const isDeleted = shop._isDeleted;

        const form = new ActionFormData().title('ประวัติการขาย').body(buildSalesHistoryBody(totals, isDeleted));

        for (const entry of sorted) {
            const { label, desc } = buildSaleButtonDesc(entry);
            form.button(label, undefined, desc);
        }

        form.button('ย้อนกลับ');

        form.show(player)
            .then((res) => {
                if (!isFormValid(player, res)) return;

                if (!player?.isValid) return;

                if (res.selection === sorted.length) {
                    if (typeof onBack === 'function') {
                        onBack(player, shop);
                    } else {
                        showInfo(player, shop);
                    }
                    return;
                }

                const entry = sorted[res.selection];

                showSaleDetail(player, shop, entry, onBack);
            })
            .catch((error) => handleFormError(player, error));
    } catch (error) {
        console.error('[Shop] showSalesHistory:', error);
    }
}

function showSaleDetail(player, shop, entry, onBack) {
    try {
        const { itemId, amount, price, buyerName, timestamp } = entry;

        const itemName = formatName(itemId || '');

        new MessageFormData()

            .title(`${itemName}`)

            .body(`§fสินค้า: §e${itemName}\n` + `§fจำนวน: §e${amount ?? 0}\n` + `§fราคา: §e${price ?? 0} $\n` + `§fผู้ซื้อ: §e${buyerName || 'Unknown'}\n` + `§fเวลา: ${formatThaiTime(timestamp)}`)

            .button1('ย้อนกลับ')

            .button2('ปิด')

            .show(player)

            .then((res) => {
                if (!isFormValid(player, res)) return;
                if (!player?.isValid) return;
                if (res.selection === 0) {
                    showSalesHistory(player, shop, onBack);
                }
            })
            .catch((error) => handleFormError(player, error));
    } catch (error) {
        console.error('[Shop] showSaleDetail:', error);
    }
}
