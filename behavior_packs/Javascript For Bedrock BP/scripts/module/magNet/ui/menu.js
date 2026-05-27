import { ActionFormData } from '@minecraft/server-ui';
import { MagnetConfig, MagnetIcons, MagnetText } from '../config.js';

const BUSY_ERROR = 'User is busy';
import { countMagnetUsers, hasMagnetUser } from '../core/state.js';
import { canUseMagnet, toggleMagnet } from '../core/toggle.js';

export const showMagnetMenu = (player) => {
    if (!canUseMagnet(player)) return;

    const isOn = hasMagnetUser(player.id);
    const current = countMagnetUsers();
    const isFull = current >= MagnetConfig.MAX_USERS;
    let btnText = isOn ? `§a${MagnetText.ON}` : `§c${MagnetText.OFF}`;
    let btnIcon = isOn ? MagnetIcons.ON : MagnetIcons.OFF;

    if (!isOn && isFull) {
        btnText = `§c${MagnetText.FULL} (${current}/${MagnetConfig.MAX_USERS})`;
        btnIcon = MagnetIcons.FULL;
    }

    const form = new ActionFormData();
    form.title('Magnet System');
    form.body(`§7Status: ${isOn ? '§aEnabled' : '§cDisabled'}`);
    form.label(`§7Players: ${current}/${MagnetConfig.MAX_USERS}`);
    form.button(btnText, btnIcon);
    form.label('                 @Sleeplite SMP');

    form.show(player)
        .then((res) => {
            if (!res || res.canceled || res.selection !== 0) return;
            if (!player.isValid) return;
            toggleMagnet(player, !isOn);
        })
        .catch((e) => {
            if (e?.message !== BUSY_ERROR) {
                if (player.isValid) {
                    player.sendMessage('§c[Magnet] เกิดข้อผิดพลาดในการเปิดเมนู');
                }
                console.error('[Magnet] showMagnetMenu: ', e);
            } else {
                player.sendMessage('§c[Magnet] โปรดรอสักครู่...');
            }
        });
};
