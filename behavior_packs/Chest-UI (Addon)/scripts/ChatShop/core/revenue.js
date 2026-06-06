import shopDatabase from './database.js';
import helpers from '../utils/helpers.js';

class Revenue {
    claimRevenue = (player, shop) => {
        try {
            const amount = shop.status.pendingRevenue;
            if (!amount || amount <= 0) {
                player.sendMessage(`§c[Shop] ไม่มีรายได้รอรับ`);
                return false;
            }

            const inventory = player.getComponent('minecraft:inventory')?.container;
            if (!inventory) return false;

            const lost = helpers.addDiamonds(inventory, amount);
            if (lost > 0) {
                const paid = amount - lost;
                shop.status.pendingRevenue = lost;
                shopDatabase.save();
                if (paid > 0) {
                    player.sendMessage(`§c[Shop] ช่องเก็บของเต็ม! ได้รับเพียง ${paid} ไดม่อน (คงค้าง ${lost})`);
                } else {
                    player.sendMessage(`§c[Shop] ช่องเก็บของเต็ม! ไม่สามารถรับรายได้`);
                }
                return paid > 0;
            }

            shop.status.pendingRevenue = 0;
            shopDatabase.save();
            player.sendMessage(`§a[Shop] รับรายได้ ${amount} ไดม่อน แล้ว`);
            return true;
        } catch (error) {
            console.error('[Shop] claimRevenue:', error);
            return false;
        }
    };
}

export default new Revenue();
