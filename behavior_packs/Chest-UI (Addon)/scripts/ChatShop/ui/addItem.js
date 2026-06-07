import { CONFIG } from '../config.js';
import { getContainer } from '../utils/blockUtils.js';
import { showAddForm } from './addItem.ui.js';

export function addItem(player, shop) {
    try {
        const container = getContainer(shop);

        if (!container) {
            player.sendMessage(`§c[Shop] ไม่สามารถเข้าถึงร้านค้าได้`);
            return;
        }

        const freeSlots = Array.from({ length: container.size }, (_, i) => i).filter((i) => !container.getItem(i));

        const hasPartialRoom = Array.from({ length: container.size }, (_, i) => i).some((i) => {
            const stack = container.getItem(i);
            if (!stack) return false;
            const max = stack.maxAmount || 64;
            return shop.prices[String(i)] !== undefined && stack.amount < max;
        });

        if (freeSlots.length === 0 && !hasPartialRoom) {
            player.sendMessage(`§c[Shop] กล่องร้านค้าเต็ม`);
            return;
        }

        if (Object.keys(shop.prices).length >= CONFIG.maxItemsPerShop && freeSlots.length === 0 && !hasPartialRoom) {
            player.sendMessage(`§c[Shop] ร้านค้ามีสินค้าครบ ${CONFIG.maxItemsPerShop} รายการแล้ว`);
            return;
        }

        showAddForm(player, shop, container, freeSlots);
    } catch (error) {
        console.error('[Shop] addItem:', error);
    }
}
