import { ModalFormData } from '@minecraft/server-ui';
import shopDatabase from '../core/database.js';
import uiUtils from '../utils/ui.js';

class ShopSettings {
    showSettings = (player, shop) => {
        try {
            const form = new ModalFormData();
            form.title('ตั้งค่าร้าน');
            form.toggle('เปิดร้าน', shop.status.isEnabled);
            form.toggle('ล็อคร้าน (กันซื้อชั่วคราว)', shop.status.isLocked);
            form.toggle('เปิดให้เจ้าของทำลายกล่องได้', shop.protection.allowOwnerBreak);
            form.toggle('ป้องกันระเบิด', !shop.protection.allowExplosion);

            uiUtils.showForm(player, form, 'shop.settings', (res) => {
                if (res.canceled) return;
                shop.status.isEnabled = res.formValues[0];
                shop.status.isLocked = res.formValues[1];
                shop.protection.allowOwnerBreak = res.formValues[2];
                shop.protection.allowExplosion = !res.formValues[3];
                shopDatabase.save();
                player.sendMessage(`§a[Shop] บันทึกการตั้งค่าร้านแล้ว`);
            });
        } catch (error) {
            console.error('[Shop] showSettings:', error);
        }
    };
}

export default new ShopSettings();
