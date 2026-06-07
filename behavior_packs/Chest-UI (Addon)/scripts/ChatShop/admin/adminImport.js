import shopDatabase from '../data/database.js';
import { importJsonData, importAllJsonData } from './adminConfig.js';

function processImport(player) {
    try {
        const jsonStr = (importJsonData || '').trim();
        if (!jsonStr) {
            player.sendMessage(`§c[Admin] ไม่พบข้อมูล JSON กรุณาใส่ข้อมูลในตัวแปร importJsonData ที่ admin/adminConfig.js`);
            return;
        }

        let importData;

        try {
            importData = JSON.parse(jsonStr);
        } catch (error) {
            player.sendMessage(`§c[Admin] JSON ไม่ถูกต้อง กรุณาตรวจสอบรูปแบบ`);
            console.info('[Admin Import Error]', error.message);
            return;
        }

        if (!importData.shopId || !importData.owner || !importData.deletedAt) {
            player.sendMessage(`§c[Admin] JSON ต้องมี shopId, owner, deletedAt`);
            return;
        }

        const data = shopDatabase.data;

        if (data.deletedShops[importData.shopId]) {
            player.sendMessage(`§c[Admin] ร้าน §e${importData.shopId} §cมีอยู่แล้วใน deletedShops`);
            return;
        }

        data.deletedShops[importData.shopId] = importData;
        shopDatabase.save();

        const salesCount = (importData.salesHistory || []).length;
        const revenue = importData.revenue || 0;

        player.sendMessage(`§a[Admin] Import ร้าน §e${importData.owner.playerName} §aเข้า deletedShops สำเร็จ!`);
        player.sendMessage(`§7ร้าน: §f${importData.shopId} §7| ขาย: §f${salesCount} §7รายการ | รายได้: §f${revenue}`);
    } catch (error) {
        console.error('[Admin] processImport:', error);
    }
}

export function importShopFromJson(player) {
    processImport(player);
}



export function importAllShopsFromJson(player) {
    try {
        const jsonStr = (importAllJsonData || '').trim();
        if (!jsonStr) {
            player.sendMessage(`§c[Admin] ไม่พบข้อมูล JSON กรุณาใส่ข้อมูลในตัวแปร importAllJsonData`);
            return;
        }

        let importData;
        try {
            importData = JSON.parse(jsonStr);
        } catch (error) {
            player.sendMessage(`§c[Admin] JSON ไม่ถูกต้อง กรุณาตรวจสอบรูปแบบ`);
            return;
        }

        if (!importData.shops && !importData.deletedShops && !importData.protectedBlocks) {
            player.sendMessage(`§c[Admin] JSON ต้องมี shops, deletedShops, หรือ protectedBlocks`);
            return;
        }

        const data = shopDatabase.data;
        let shopsAdded = 0, deletedAdded = 0, blocksAdded = 0;

        if (importData.shops) {
            for (const [id, shop] of Object.entries(importData.shops)) {
                if (!data.shops[id]) {
                    data.shops[id] = shop;
                    shopsAdded++;
                }
            }
        }

        if (importData.deletedShops) {
            for (const [id, shop] of Object.entries(importData.deletedShops)) {
                if (!data.deletedShops[id]) {
                    data.deletedShops[id] = shop;
                    deletedAdded++;
                }
            }
        }

        if (importData.protectedBlocks) {
            for (const [key, id] of Object.entries(importData.protectedBlocks)) {
                if (!data.protectedBlocks[key]) {
                    data.protectedBlocks[key] = id;
                    blocksAdded++;
                }
            }
        }

        shopDatabase.save();
        player.sendMessage(`§a[Admin] Import สำเร็จ: §fร้าน ${shopsAdded} | ลบแล้ว ${deletedAdded} | บล็อค ${blocksAdded}`);
    } catch (error) {
        console.error('[Admin] importAllShopsFromJson:', error);
    }
}
