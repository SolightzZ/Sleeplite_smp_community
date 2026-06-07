import { ActionFormData, MessageFormData } from '@minecraft/server-ui';
import shopDatabase from '../data/database.js';
import { deleteShop } from '../utils/blockUtils.js';
import { coordinateKey, currentTimestamp, formatThaiTime, isFormValid } from '../utils/helpers.js';
import { handleFormError } from '../utils/UIUtils.js';
import { showSalesHistory } from '../ui/salesHistory.js';
import { showAdminPanel } from './adminPanel.js';
import { exportShopToJson } from './adminExport.js';

export function showAdminShopInfo(player, shop) {
    try {
        const isDeleted = shop._isDeleted;

        const loc = shop.location || {};

        const prices = Object.keys(shop.prices || {}).length;

        const salesCount = Object.values(shop.buyers || {}).reduce((sum, b) => sum + (b.buyCount || 0), 0);

        const revenue = Object.values(shop.buyers || {}).reduce((sum, b) => sum + (b.spent || 0), 0);

        let body =
            `ID: ${shop.shopId}\n` +
            `เจ้าของ: ${shop.owner?.playerName || 'Unknown'}\n` +
            `ตำแหน่ง: ${loc.x}, ${loc.y}, ${loc.z}\n` +
            `สินค้า: ${prices} รายการ\n` +
            `ยอดขาย: ${salesCount} ครั้ง\n` +
            `รายได้: ${revenue} $\n` +
            `สร้าง: ${formatThaiTime(shop.createdAt)}\n`;

        if (isDeleted) {
            body += `ลบเมื่อ: ${formatThaiTime(shop.deletedAt)}\n`;
            body += `สถานะ: ถูกลบแล้ว`;
        } else {
            body += `สถานะ: ${shop.status?.isEnabled ? 'เปิด' : shop.status?.isLocked ? 'ล็อค' : 'ปิด'}`;
        }

        const form = new ActionFormData().title(`ร้านของ ${shop.owner?.playerName || 'Unknown'}`).body(body);

        if (isDeleted) {
            form.button('กู้คืนร้านค้า', 'textures/ui/icon_multiplayer.png');

            form.button('ลบร้านค้า', 'textures/ui/icon_trash.png');

            form.button('ประวัติการขาย', 'textures/ui/icons/icon_deals.png');

            form.button('Export JSON', 'textures/ui/settings_pause_menu_icon.png');
        } else {
            form.button('ลบร้านค้า', 'textures/ui/icon_trash.png');

            form.button('ประวัติการขาย', 'textures/ui/icons/icon_deals.png');
        }

        form.button('ย้อนกลับ');

        form.show(player)

            .then((res) => {
                if (!isFormValid(player, res)) return;
                if (!player?.isValid()) return;

                if (isDeleted) {
                    //ร้านที่ถูกลบ: restore(0), permDelete(1), history(2), export(3), back(4)
                    switch (res.selection) {
                        case 0:
                            confirmAdminRestore(player, shop);
                            break;
                        case 1:
                            confirmAdminPermanentDelete(player, shop);
                            break;
                        case 2:
                            showSalesHistory(player, shop, showAdminShopInfo);
                            break;
                        case 3:
                            exportShopToJson(player, shop);
                            showAdminShopInfo(player, shop);
                            break;
                        case 4:
                            showAdminPanel(player);
                            break;
                    }
                } else {
                    //ร้านที่เปิดอยู่: delete(0), history(1), back(2)
                    switch (res.selection) {
                        case 0:
                            confirmAdminDelete(player, shop);
                            break;
                        case 1:
                            showSalesHistory(player, shop, showAdminShopInfo);
                            break;
                        case 2:
                            showAdminPanel(player);
                            break;
                    }
                }
            })
            .catch((error) => handleFormError(player, error));
    } catch (error) {
        console.error('[Admin] showAdminShopInfo:', error);
    }
}

function confirmAdminRestore(player, shop) {
    try {
        new MessageFormData()
            .title('กู้คืนร้านค้า')

            .body(
                `คุณแน่ใจที่จะกู้คืนร้านของ ${shop.owner?.playerName || 'Unknown'} ?\n\n` +
                    `ร้าน: ${shop.shopId}\n` +
                    `ตำแหน่ง: ${shop.location?.x}, ${shop.location?.y}, ${shop.location?.z}\n` +
                    `ร้านจะกลับมาเปิดขายได้อีกครั้ง\n` +
                    `ประวัติการซื้อขายทั้งหมดจะถูกกู้คืนด้วย`,
            )

            .button1('ยืนยันกู้คืน')

            .button2('ยกเลิก')

            .show(player)

            .then((res) => {
                if (!isFormValid(player, res)) return;
                if (res.selection !== 0) {
                    showAdminShopInfo(player, shop);
                    return;
                }

                const data = shopDatabase.data;
                if (!data.deletedShops || !data.deletedShops[shop.shopId]) {
                    player.sendMessage('[Admin] ไม่พบข้อมูลร้านค้าที่ต้องการกู้คืน');
                    return;
                }

                const restoredShop = data.deletedShops[shop.shopId];
                delete restoredShop._isDeleted;
                delete restoredShop.deletedAt;
                delete restoredShop.archived;
                restoredShop.updatedAt = currentTimestamp();

                const loc = restoredShop.location;
                const blockKey = coordinateKey(loc.x, loc.y, loc.z);

                const existingShopId = data.protectedBlocks[blockKey];
                if (existingShopId) {
                    const existingShop = data.shops[existingShopId];

                    if (!existingShop) {
                        //ล้างข้อมูลเก่า - protected block entry ค้างไม่มีร้านอยู่แล้ว
                        delete data.protectedBlocks[blockKey];
                    } else {
                        const ownerName = existingShop?.owner?.playerName || 'Unknown';
                        player.sendMessage(`§c[Admin] ไม่สามารถกู้คืนร้านได้: มีร้านของ §e${ownerName} §cใช้ตำแหน่ง ${loc.x}, ${loc.y}, ${loc.z} อยู่แล้ว`);
                        player.sendMessage(`§c[Admin] กรุณาลบร้านค้านั้นก่อน หรือเลือกร้านอื่น`);
                        return;
                    }
                }

                data.protectedBlocks[blockKey] = shop.shopId;
                data.shops[shop.shopId] = restoredShop;
                delete data.deletedShops[shop.shopId];
                shopDatabase.save();

                const ownerName = shop.owner?.playerName || 'Unknown';

                player.sendMessage(`[Admin] กู้คืนร้านของ ${ownerName} เรียบร้อยแล้ว`);

                showAdminPanel(player);
            })
            .catch((error) => handleFormError(player, error));
    } catch (error) {
        console.error('[Admin] confirmAdminRestore:', error);
    }
}

function confirmAdminPermanentDelete(player, shop) {
    try {
        new MessageFormData()
            .title('ลบข้อมูลร้านถาวร')

            .body(
                `คุณแน่ใจที่จะลบข้อมูลร้านของ ${shop.owner?.playerName || 'Unknown'} ออกจากระบบอย่างถาวร?\n\n` +
                    `ร้าน: ${shop.shopId}\n` +
                    `ตำแหน่ง: ${shop.location?.x}, ${shop.location?.y}, ${shop.location?.z}\n` +
                    `ข้อมูลทั้งหมดของร้านนี้จะถูกลบทิ้ง\n\n` +
                    `การกระทำนี้ไม่สามารถย้อนกลับได้!`,
            )

            .button1('ยืนยันลบถาวร')

            .button2('ยกเลิก')

            .show(player)

            .then((res) => {
                if (!isFormValid(player, res)) return;
                if (res.selection !== 0) {
                    showAdminShopInfo(player, shop);
                    return;
                }

                const data = shopDatabase.data;
                if (data.deletedShops && data.deletedShops[shop.shopId]) {
                    delete data.deletedShops[shop.shopId];
                    shopDatabase.save();
                }

                const ownerName = shop.owner?.playerName || 'Unknown';
                player.sendMessage(`[Admin] ลบข้อมูลร้านของ ${ownerName} ออกจากระบบอย่างถาวรแล้ว`);
                showAdminPanel(player);
            })
            .catch((error) => handleFormError(player, error));
    } catch (error) {
        console.error('[Admin] confirmAdminPermanentDelete:', error);
    }
}

function confirmAdminDelete(player, shop) {
    try {
        new MessageFormData()
            .title('ยืนยันการลบร้าน')

            .body(
                `คุณแน่ใจที่จะลบร้านของ ${shop.owner?.playerName || 'Unknown'} ?\n\n` +
                    `ร้าน: ${shop.shopId}\n` +
                    `ตำแหน่ง: ${shop.location?.x}, ${shop.location?.y}, ${shop.location?.z}\n` +
                    `สินค้าทั้งหมดจะถูกล้างออก\n` +
                    `ประวัติการขายจะถูกเก็บไว้\n\n` +
                    `การกระทำนี้ไม่สามารถย้อนกลับได้!`,
            )

            .button1('ยืนยันลบ')

            .button2('ยกเลิก')

            .show(player)

            .then((res) => {
                if (!isFormValid(player, res)) return;
                if (res.selection !== 0) {
                    showAdminShopInfo(player, shop);
                    return;
                }

                const shopId = shop.shopId;
                const ownerName = shop.owner?.playerName || 'Unknown';
                deleteShop(shopId);
                player.sendMessage(`[Admin] ลบร้านของ ${ownerName} เรียบร้อยแล้ว`);
            })
            .catch((error) => handleFormError(player, error));
    } catch (error) {
        console.error('[Admin] confirmAdminDelete:', error);
    }
}
