import { ActionFormData, MessageFormData } from '@minecraft/server-ui';
import { formatThaiTime, isFormValid } from '../utils/helpers.js';
import { handleFormError } from '../utils/UIUtils.js';
import { showInfo } from './shopInfo.js';

export function showBuyersList(player, shop) {
    try {
        const buyers = Object.entries(shop.buyers || {});

        if (buyers.length === 0) {
            player.sendMessage(`§c[Shop] ยังไม่มีผู้ซื้อ`);
            showInfo(player, shop);
            return;
        }

        const form = new ActionFormData().title('รายชื่อผู้ซื้อ').body(`§fมีผู้ซื้อทั้งหมด §e${buyers.length} §fคน`);

        for (const [buyerId, buyerData] of buyers) {
            const displayName = buyerData.playerName?.substring(0, 12) || 'Unknown';
            form.button(`§f${displayName}`, 'textures/ui/icon_multiplayer.png');
        }

        form.button('ย้อนกลับ');

        form.show(player)
            .then((res) => {
                if (!isFormValid(player, res)) return;
                if (!player?.isValid) return;
                if (res.selection === buyers.length) {
                    showInfo(player, shop);
                    return;
                }

                const [buyerId, buyerData] = buyers[res.selection];

                showBuyerDetail(player, shop, buyerId, buyerData);
            })
            .catch((error) => handleFormError(player, error));
    } catch (error) {
        console.error('[Shop] showBuyersList:', error);
    }
}

function showBuyerDetail(player, shop, buyerId, buyerData) {
    try {
        const { playerName, buyCount, spent, lastBuy } = buyerData;

        new MessageFormData()

            .title(`${playerName}`)

            .body(`§fซื้อทั้งหมด: §e${buyCount ?? 0} §fครั้ง\n` + `§fใช้เงินไป: §e${spent ?? 0} $\n` + `§fซื้อล่าสุด: ${formatThaiTime(lastBuy)}`)

            .button1('ย้อนกลับ')

            .button2('ปิด')

            .show(player)

            .then((res) => {
                if (!isFormValid(player, res)) return;

                if (!player?.isValid) return;

                if (res.selection === 0) {
                    showBuyersList(player, shop);
                }
            })
            .catch((error) => handleFormError(player, error));
    } catch (error) {
        console.error('[Shop] showBuyerDetail:', error);
    }
}
