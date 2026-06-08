import { MessageFormData, ModalFormData } from '@minecraft/server-ui';
import { getContainer } from '../utils/blockUtils.js';
import { isFormValid } from '../utils/helpers.js';
import { handleFormError } from '../utils/UIUtils.js';
import { clearAndDelete, validateDeleteInput } from './deleteConfirm.js';

function countItems(container) {
    if (!container) return 0;

    return Array.from({ length: container.size }).filter((_, i) => container.getItem(i)).length;
}

export function confirmDelete(player, shop) {
    try {
        const container = getContainer(shop);

        const itemCount = container ? countItems(container) : 0;

        new MessageFormData()

            .title('§cคำเตือน - ลบร้าน')

            .body(
                `§cคุณกำลังจะลบร้านนี้!\n\n` +
                    `§fร้าน: §e${shop.shopId}\n` +
                    `§fเจ้าของ: §e${shop.owner?.playerName || 'Unknown'}\n` +
                    `§fสินค้า: §e${itemCount} §fรายการ (จะถูกคืน/วางบนพื้น)\n\n` +
                    `§7เพื่อป้องกันการลบผิดพลาด กรุณากรอกข้อมูลให้ถูกต้อง\n` +
                    `§7ในขั้นตอนถัดไป:\n` +
                    `§7- ใส่ §eรหัสร้านค้า (Shop ID)§7\n` +
                    `§7- ใส่ §eชื่อเจ้าของร้าน§7\n` +
                    `§7- เลื่อนสไลด์ไปที่ §e100 §7เพื่อยืนยัน`,
            )

            .button1('ดำเนินการต่อ')

            .button2('ยกเลิก')

            .show(player)

            .then((res) => {
                if (!isFormValid(player, res)) return;

                if (!player?.isValid) return;

                if (res.selection !== 0) return;

                showDeleteConfirmationForm(player, shop);
            })
            .catch((error) => handleFormError(player, error));
    } catch (error) {
        console.error('[Shop] confirmDelete:', error);
    }
}

function showDeleteConfirmationForm(player, shop) {
    try {
        const expectedShopId = shop.shopId || '';

        const expectedOwnerName = shop.owner?.playerName || '';

        const form = new ModalFormData()

            .title('ยืนยันลบร้าน (3 ขั้นตอน)')

            .textField('§7ขั้นตอนที่ 1/3: ใส่รหัสร้านค้า', expectedShopId, '')

            .textField('§7ขั้นตอนที่ 2/3: ใส่ชื่อเจ้าของร้าน', expectedOwnerName, '')

            .slider('§7ขั้นตอนที่ 3/3: เลื่อนสไลด์ไปที่ 100 เพื่อยืนยัน', 0, 100, 1, 0);

        form.show(player)
            .then((res) => {
                if (!isFormValid(player, res)) return;
                if (!player?.isValid) return;

                const formValues = res.formValues;
                const inputShopId = String(formValues[0] || '').trim();
                const inputOwnerName = String(formValues[1] || '').trim();
                const sliderValue = Number(formValues[2] || 0);

                const errors = validateDeleteInput(inputShopId, inputOwnerName, sliderValue, expectedShopId, expectedOwnerName);

                if (errors.length > 0) {
                    const errorMsg = errors.join('\n');
                    player.sendMessage(`§c[Shop] ลบร้านไม่สำเร็จ กรุณาตรวจสอบ:\n${errorMsg}\n§7[Shop] กรุณาลองใหม่อีกครั้ง`);
                    return;
                }

                clearAndDelete(player, shop);
            })
            .catch((error) => handleFormError(player, error));
    } catch (error) {
        console.error('[Shop] showDeleteConfirmationForm:', error);
    }
}
