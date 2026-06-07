import { currentTimestamp } from '../utils/helpers.js';
import shopDatabase from '../data/database.js';

export function exportAllShopsToJson(player) {
    try {
        const jsonStr = JSON.stringify(shopDatabase.data, null, 2);
        const storeKey = `export_all_${currentTimestamp()}`;

        console.info(`[Admin Export All] ${storeKey}:`);
        console.info(jsonStr);

        player.sendMessage(`§a[Admin] §fExport ข้อมูลทั้งหมดเรียบร้อย`);
        player.sendMessage(`§7ดู JSON ได้ที่ Console (key: ${storeKey})`);
    } catch (error) {
        console.error('[Admin] exportAllShopsToJson:', error);
    }
}

export function exportShopToJson(player, shop) {
    try {
        const exportData = {
            shopId: shop.shopId,
            exportedAt: new Date().toISOString(),
            owner: shop.owner,
            location: shop.location,
            createdAt: shop.createdAt,
            deletedAt: shop.deletedAt,
            prices: shop.prices || {},
            buyers: shop.buyers || {},
            salesHistory: shop.salesHistory || [],
            salesSummary: Object.values(shop.buyers || {}).reduce((sum, b) => sum + (b.buyCount || 0), 0),
            revenue: Object.values(shop.buyers || {}).reduce((sum, b) => sum + (b.spent || 0), 0),
        };

        const jsonStr = JSON.stringify(exportData, null, 2);

        const storeKey = `export_${shop.shopId}_${currentTimestamp()}`;

        console.info(`[Admin Export] ${storeKey}:`);

        console.info(jsonStr);

        player.sendMessage(`§a[Admin] §fExport ข้อมูลร้าน §e${shop.owner?.playerName || 'Unknown'} §fเรียบร้อย`);

        player.sendMessage(`§7ดู JSON ได้ที่ Console (key: ${storeKey})`);
    } catch (error) {
        console.error('[Admin] exportShopToJson:', error);
    }
}
