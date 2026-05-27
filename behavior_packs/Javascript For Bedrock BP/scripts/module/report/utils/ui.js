import { MessageFormData } from '@minecraft/server-ui';

export const BUSY_ERROR = 'User is busy';

export const handleUiError = (player, source, error) => {
    if (error?.message === BUSY_ERROR) {
        if (player?.isValid) player.sendMessage('§c[Report] โปรดรอสักครู่...');
        return;
    }

    if (player?.isValid) {
        player.sendMessage('§c[Report] เกิดข้อผิดพลาดในการเปิดเมนู');
    }

    const message = error?.stack ?? error?.message ?? String(error);
    console.error(`[Report] ${source}: ${message}`);
};

export const showForm = (player, form, source, onSubmit) => {
    try {
        form.show(player)
            .then((res) => {
                if (!player?.isValid) return;
                onSubmit(res);
            })
            .catch((error) => handleUiError(player, source, error));
    } catch (error) {
        handleUiError(player, source, error);
    }
};

export const sure = (player, onConfirm, onCancel) => {
    try {
        const ui = new MessageFormData();
        ui.title('ยืนยันการลบข้อมูล');
        ui.body('ท่านแน่ใจหรือไม่ที่จะลบรายการนี้? การกระทำนี้ไม่สามารถยกเลิกได้');
        ui.button1('Confirm (ยืนยัน)');
        ui.button2('Cancel (ยกเลิก)');

        showForm(player, ui, 'sure', (res) => {
            if (res.canceled) {
                if (onCancel) onCancel();
                return;
            }
            if (res.selection === 0) onConfirm();
            else if (onCancel) onCancel();
        });
    } catch (e) {
        console.warn('[ Report ] System Error (Sure): ' + e);
    }
};
