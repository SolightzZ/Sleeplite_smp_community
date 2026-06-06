import { MessageFormData } from '@minecraft/server-ui';

class UIUtils {
    handleError = (player, source, error) => {
        if (player?.isValid) {
            player.sendMessage('§c[Shop] เกิดข้อผิดพลาดในการเปิดเมนู');
        }
        const message = error?.stack ?? error?.message ?? String(error);
        console.error(`[Shop] ${source}: ${message}`);
    };

    showForm = (player, form, source, onSubmit) => {
        return form
            .show(player)
            .then((res) => {
                if (!player?.isValid) return;
                onSubmit(res);
            })
            .catch((error) => this.handleError(player, source, error));
    };

    confirm = (player, onConfirm, onCancel) => {
        const ui = new MessageFormData();
        ui.title('ยืนยัน');
        ui.body('คุณแน่ใจหรือไม่?');
        ui.button1('ยืนยัน');
        ui.button2('ยกเลิก');

        this.showForm(player, ui, 'sure', (res) => {
            if (res.canceled) {
                if (onCancel) onCancel();
                return;
            }
            if (res.selection === 0) onConfirm();
            else if (onCancel) onCancel();
        }).catch((error) => console.error('[Shop] System Error (Sure):', error));
    };
}

export default new UIUtils();
