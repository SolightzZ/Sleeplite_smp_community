import { ActionFormData } from '@minecraft/server-ui';
import { CONFIG } from '../config.js';
import shopDatabase from '../data/database.js';
import { isFormValid } from '../utils/helpers.js';
import { handleFormError } from '../utils/UIUtils.js';
import { showBuyMenu } from '../ui/buyMenu.js';
import { showAdminShopInfo } from './adminManage.js';
import { importShopFromJson, importAllShopsFromJson } from './adminImport.js';
import { exportAllShopsToJson } from './adminExport.js';

export function showAdminPanel(player) {
    try {
        const activeShops = Object.entries(shopDatabase.data.shops || {}).map(([id, shop]) => ({ ...shop, shopId: id }));
        const deletedShops = Object.entries(shopDatabase.data.deletedShops || {}).map(([id, shop]) => ({
            ...shop,
            shopId: id,
            _isDeleted: true,
        }));

        if (activeShops.length === 0 && deletedShops.length === 0) {
            player.sendMessage('[Admin] ไม่มีร้านค้าในระบบ');
            return;
        }

        const form = new ActionFormData().title('Admin Panel - จัดการร้านค้า').body('เลือกรายการที่ต้องการจัดการ');

        form.button(`ร้านที่เปิดอยู่ (${activeShops.length} ร้าน)`, 'textures/ui/icon_multiplayer.png');

        form.button(`ร้านที่ถูกลบ (${deletedShops.length} ร้าน)`, 'textures/ui/icon_trash.png');

        form.button('Setting data', 'textures/ui/settings_glyph_color_2x.png');

        form.button('ปิด');

        form.show(player)
            .then((res) => {
                if (!isFormValid(player, res)) return;
                if (!player?.isValid()) return;
                switch (res.selection) {
                    case 0:
                        showActiveShopList(player, activeShops);
                        break;
                    case 1:
                        showDeletedShopList(player, deletedShops);
                        break;
                    case 2:
                        showSettingData(player);
                        break;
                }
            })
            .catch((error) => handleFormError(player, error));
    } catch (error) {
        console.error('[Admin] showAdminPanel:', error);
    }
}

function showSettingData(player) {
    const form = new ActionFormData();

    form.title('Setting data');

    form.body('เลือกรายการที่ต้องการจัดการ');

    form.button('Import JSON', 'textures/ui/Caution.png');

    form.button('Import JSON All', 'textures/ui/ErrorGlyph_small_hover.png');

    form.button('Export JSON All', 'textures/ui/ErrorGlyph_small.png');

    form.button('ย้อนกลับ');

    form.show(player)
        .then((res) => {
            if (!isFormValid(player, res)) return;
            if (!player?.isValid()) return;
            switch (res.selection) {
                case 0:
                    importShopFromJson(player);
                    showSettingData(player);
                    break;
                case 1:
                    importAllShopsFromJson(player);
                    showSettingData(player);
                    break;
                case 2:
                    exportAllShopsToJson(player);
                    showSettingData(player);
                    break;
                case 3:
                    showAdminPanel(player);
                    break;
            }
        })
        .catch((error) => handleFormError(player, error));
}

function showActiveShopList(player, shops) {
    try {
        if (shops.length === 0) {
            player.sendMessage('[Admin] ไม่มีร้านที่เปิดอยู่');
            return;
        }

        const form = new ActionFormData().title('ร้านที่เปิดอยู่').body(`ทั้งหมด ${shops.length} ร้าน\n\nคลิกเลือกร้านค้าเพื่อจัดการ`);

        for (const shop of shops) {
            const ownerName = shop.owner?.playerName || 'Unknown';

            const statusText = shop.status?.isEnabled ? '[เปิด]' : shop.status?.isLocked ? '[ล็อค]' : '[ปิด]';

            const itemCount = Object.keys(shop.prices || {}).length;

            form.button(`${statusText} ${ownerName} (${itemCount} สินค้า)`, 'textures/ui/icon_multiplayer.png');
        }

        form.button('ย้อนกลับ');

        form.show(player)
            .then((res) => {
                if (!isFormValid(player, res)) return;
                if (!player?.isValid()) return;
                if (res.selection === shops.length) {
                    showAdminPanel(player);
                    return;
                }
                const shop = shops[res.selection];
                showAdminShopInfo(player, shop);
            })
            .catch((error) => handleFormError(player, error));
    } catch (error) {
        console.error('[Admin] showActiveShopList:', error);
    }
}

function showDeletedShopList(player, shops) {
    try {
        if (shops.length === 0) {
            player.sendMessage('[Admin] ไม่มีร้านที่ถูกลบ');
            return;
        }

        const form = new ActionFormData().title('ร้านที่ถูกลบ').body(`ทั้งหมด ${shops.length} ร้าน\n\nคลิกเลือกร้านค้าเพื่อดูข้อมูล`);

        for (const shop of shops) {
            const ownerName = shop.owner?.playerName || 'Unknown';
            form.button(`[ลบแล้ว] ${ownerName}`, 'textures/ui/icon_trash.png');
        }

        form.button('ย้อนกลับ');

        form.show(player)
            .then((res) => {
                if (!isFormValid(player, res)) return;
                if (!player?.isValid()) return;
                if (res.selection === shops.length) {
                    showAdminPanel(player);
                    return;
                }

                const shop = shops[res.selection];

                showAdminShopInfo(player, shop);
            })
            .catch((error) => handleFormError(player, error));
    } catch (error) {
        console.error('[Admin] showDeletedShopList:', error);
    }
}

export function isAdmin(player) {
    if (!player?.isValid()) return false;
    try {
        return player.hasTag(CONFIG.adminTag);
    } catch {
        return false;
    }
}

export function showAdminInteract(player, shop) {
    try {
        const form = new ActionFormData()

            .title(`Admin: ${shop.owner?.playerName || 'Unknown'}`)

            .body(`คุณเป็น Admin สามารถจัดการร้านนี้ได้`)

            .button('จัดการร้าน', 'textures/ui/icon_deals.png')

            .button('ซื้อสินค้า', 'textures/items/diamond')

            .button('ยกเลิก');

        form.show(player)
            .then((res) => {
                if (!isFormValid(player, res)) return;
                if (!player?.isValid()) return;
                switch (res.selection) {
                    case 0:
                        showAdminShopInfo(player, shop);
                        break;
                    case 1:
                        if (shop.status?.isEnabled && !shop.status?.isLocked) {
                            showBuyMenu(player, shop);
                        } else {
                            player.sendMessage(`§c[Shop] ร้านนี้ถูกปิดหรือล็อคอยู่`);
                        }
                        break;
                }
            })
            .catch((error) => console.error('[Shop] showAdminInteract:', error));
    } catch (error) {
        console.error('[Shop] showAdminInteract:', error);
    }
}
