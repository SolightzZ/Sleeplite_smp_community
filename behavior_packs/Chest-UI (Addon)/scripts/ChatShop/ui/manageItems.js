import { ActionFormData } from '@minecraft/server-ui';
import blockUtils from '../utils/blockUtils.js';
import uiUtils from '../utils/ui.js';
import shopInfo from './shopInfo.js';
import shopSettings from './shopSettings.js';
import addItem from './addItem.js';
import editPrice from './editPrice.js';
import removeItem from './removeItem.js';
import deleteShop from './deleteShop.js';

class ManageItems {
    manageItems = (player, shop) => {
        try {
            const container = blockUtils.getContainer(shop);
            const itemCount = container ? this.countChestItems(container) : 0;

            const form = new ActionFormData()
                .title('จัดการสินค้า')
                .body(`§7ร้านของ ${shop.owner.playerName} — ${itemCount} สินค้า`)
                .button('เพิ่มสินค้า', 'textures/items/chest')
                .button('แก้ไขราคา', 'textures/items/comparator')
                .button('ลบสินค้า', 'textures/items/lava_bucket')
                .button('ข้อมูลร้าน', 'textures/items/book_normal')
                .button('ตั้งค่าร้าน', 'textures/items/comparator')
                .button('ลบร้าน', 'textures/items/tnt')
                .button('ปิด', 'textures/ui/arrow_left');

            uiUtils.showForm(player, form, 'shop.manage', (res) => {
                if (res.canceled) return;
                switch (res.selection) {
                    case 0:
                        addItem.addItem(player, shop);
                        break;
                    case 1:
                        editPrice.editPrice(player, shop);
                        break;
                    case 2:
                        removeItem.removeItem(player, shop);
                        break;
                    case 3:
                        shopInfo.showInfo(player, shop);
                        break;
                    case 4:
                        shopSettings.showSettings(player, shop);
                        break;
                    case 5:
                        deleteShop.confirmDelete(player, shop);
                        break;
                }
            });
        } catch (error) {
            console.error('[Shop] manageItems:', error);
        }
    };

    countChestItems = (container) => {
        if (!container) return 0;
        return Array.from({ length: container.size }).filter((_, i) => container.getItem(i)).length;
    };
}

export default new ManageItems();
