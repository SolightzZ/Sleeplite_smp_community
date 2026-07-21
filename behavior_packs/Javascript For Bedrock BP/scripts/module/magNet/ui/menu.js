import { ActionFormData } from '@minecraft/server-ui';
import { logError } from '../../../events/logger.js';
import { cache } from '../../../shared/cache.js';
import { MagnetConfig, MagnetIcons, MagnetText } from '../config.js';
import { countMagnetUsers, hasMagnetUser } from '../core/state.js';
import { canUseMagnet, toggleMagnet } from '../core/toggle.js';
import { pcheck } from './../../../shared/player.js';

export const showMagnetMenu = (player) => {
   if (!canUseMagnet(player)) return;

   const isOn = hasMagnetUser(player.id);
   const current = countMagnetUsers();
   const isFull = current >= MagnetConfig.MAX_USERS;
   let btnText = isOn ? `§a${MagnetText.ON}` : `§c${MagnetText.OFF}`;

   if (!isOn && isFull) {
      btnText = `§c${MagnetText.FULL} (${current}/${MagnetConfig.MAX_USERS})`;
   }

   const btnIcon = isOn ? MagnetIcons.ON : isFull ? MagnetIcons.FULL : MagnetIcons.OFF;

   const form = new ActionFormData();
   form.title('Magnet | แม่เหล็ก');
   form.body(`                 §7Players: ${current}/${MagnetConfig.MAX_USERS}`);
   form.header(`${isOn ? '        §aEnabled' : '       §cDisabled'}`);
   form.divider();
   form.button(btnText, btnIcon);
   form.label('                @Sleeplite 2026');
   cache.playSound(player, 'vault.open_shutter');

   form
      .show(player)
      .then((res) => {
         if (!res || res.canceled || res.selection !== 0) return;
         if (!pcheck(player)) return;
         toggleMagnet(player, !hasMagnetUser(player.id));
      })
      .catch((error) => logError('Magnet', 'UI Error', error));
};
