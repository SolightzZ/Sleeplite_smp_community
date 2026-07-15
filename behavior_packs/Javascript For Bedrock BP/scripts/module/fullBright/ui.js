import { ActionFormData } from '@minecraft/server-ui';
import { logError } from '../../events/logger.js';
import { cache } from '../../shared/cache.js';
import { pcheck } from './../../shared/player.js';
import { btnOff, btnOn, headerDisabled, headerEnabled, iconOff, iconOn, msgOff, msgOn, soundOff, soundOn, soundOpen, title } from './config.js';
import { hasBright, toggleBright } from './state.js';

export function showMenu(player) {
   if (!pcheck(player)) return;

   const isOn = hasBright(player);

   const form = new ActionFormData();
   form.title(title);
   form.header(isOn ? headerEnabled : headerDisabled);
   form.button(isOn ? btnOff : btnOn, isOn ? iconOn : iconOff);
   form.label('               @Sleeplite 2026');

   cache.playSound(player, soundOpen);

   form
      .show(player)
      .then((res) => {
         if (!res || res.canceled || res.selection !== 0) return;

         const next = toggleBright(player);

         if (pcheck(player)) {
            cache.playSound(player, next ? soundOn : soundOff);
            cache.setActionBar(player.onScreenDisplay, next ? `${msgOn} §f(${player.name})` : `${msgOff} §f(${player.name})`);
         }
      })
      .catch((error) => logError('FullBright', 'UI Error', error));
}
