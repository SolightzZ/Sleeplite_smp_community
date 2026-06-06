import { ActionFormData } from '@minecraft/server-ui';
import blockUtils from '../utils/blockUtils.js';
import uiUtils from '../utils/ui.js';
import { showInfo } from './shopInfo.js';
import { showSettings } from './shopSettings.js';
import { addItem } from './addItem.js';
import { editPrice } from './editPrice.js';
import { removeItem } from './removeItem.js';
import { confirmDelete } from './deleteShop.js';

export function manageItems(player, shop) {
    try {
        const container = blockUtils.getContainer(shop);
        const itemCount = container ? countChestItems(container) : 0;

        const form = new ActionFormData()
            .title('จัดการสินค้า')
            .body(`§7ร้านของ ${shop.owner.playerName} — ${itemCount} สินค้า`)
            .button('เพิ่มสินค้า', 'textures/ui/icons/icon_deals.png')
            .button('แก้ไขราคา', 'textures/ui/icons/icon_mashuphanger.png')
            .button('ลบสินค้า', 'textures/ui/icons/icon_trailer.png')
            .button('ข้อมูลร้าน', 'textures/ui/icons/icon_multiplayer.png')
            .button('ลบร้าน', 'textures/ui/icon_trash.png')
            .button('ปิด');

        uiUtils.showForm(player, form, 'shop.manage', (res) => {
            if (res.canceled) return;
            switch (res.selection) {
                case 0:
                    addItem(player, shop);
                    break;
                case 1:
                    editPrice(player, shop);
                    break;
                case 2:
                    removeItem(player, shop);
                    break;
                case 3:
                    showInfo(player, shop);
                    break;
                case 4:
                    confirmDelete(player, shop);
                    break;
            }
        });
    } catch (error) {
        console.error('[Shop] manageItems:', error);
    }
}

function countChestItems(container) {
    if (!container) return 0;
    return Array.from({ length: container.size }).filter((_, i) => container.getItem(i)).length;
}
