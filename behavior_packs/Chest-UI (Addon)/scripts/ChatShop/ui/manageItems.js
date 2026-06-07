import { ActionFormData } from '@minecraft/server-ui';
import { getContainer } from '../utils/blockUtils.js';
import { handleFormError } from '../utils/UIUtils.js';
import { isFormValid } from '../utils/helpers.js';
import { addItem } from './addItem.js';
import { confirmDelete } from './deleteShop.js';
import { editPrice } from './editPrice.js';
import { removeItem } from './removeItem.js';
import { showInfo } from './shopInfo.js';
import { isAdmin, showAdminPanel } from '../admin/adminPanel.js';

function countItems(container) {
    if (!container) return 0;
    return Array.from({ length: container.size }).filter((_, i) => container.getItem(i)).length;
}

export function manageItems(player, shop) {
    try {
        const container = getContainer(shop);

        const itemCount = container ? countItems(container) : 0;

        const playerIsAdmin = isAdmin(player);

        const form = new ActionFormData()

            .title('จัดการสินค้า')

            .body(`§7ร้านของ ${shop.owner.playerName} — ${itemCount} สินค้า`)

            .button('เพิ่มสินค้า', 'textures/ui/icons/icon_deals.png')

            .button('แก้ไขสินค้า', 'textures/ui/icons/icon_mashuphanger.png')

            .button('ลบสินค้า', 'textures/ui/icons/icon_trailer.png')

            .button('ข้อมูลร้าน', 'textures/ui/icons/icon_multiplayer.png')

            .button('ลบร้าน', 'textures/ui/icon_trash.png');

        if (playerIsAdmin) {
            form.button('Admin Panel', 'textures/ui/settings_pause_menu_icon.png');
        }

        form.show(player)
            .then((res) => {
                if (!isFormValid(player, res)) return;
                if (!player?.isValid()) return;
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
                    case 5:
                        if (playerIsAdmin) showAdminPanel(player);
                        break;
                }
            })
            .catch((error) => handleFormError(player, error));
    } catch (error) {
        console.error('[Shop] manageItems:', error);
    }
}
