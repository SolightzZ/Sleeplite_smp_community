import { ActionFormData } from '@minecraft/server-ui';

import { hasBright, toggleBright } from './state.js';
import { addSound } from '../../plugin/utils.js';
import { logError } from '../../router/core/logger.js';

export function showMenu(player) {
   if (!player || !player.isValid) return;

   const isOn = hasBright(player);

   const form = new ActionFormData();
   form.title('FullBright | มองในที่มืด');
   form.header(isOn ? `       §aEnabled` : `        §cDisabled`);
   form.button(isOn ? 'Turn Off' : 'Turn On', isOn ? 'textures/items/fullbright' : 'textures/ui/icon_none');
   form.label('               @Sleeplite 2026');

   addSound(player, 'mob.reset_growth');

   form
      .show(player)
      .then((res) => {
         if (!res || res.canceled || res.selection !== 0) return;

         const next = toggleBright(player);

         if (player.isValid) {
            addSound(player, next ? 'ominous_item_spawner.spawn_item_begin' : 'ominous_item_spawner.spawn_item');
            player.onScreenDisplay.setActionBar(next ? `§aBright ON §f(${player.name})` : `§cBright OFF §f(${player.name})`);
         }
      })
      .catch((error) => logError('FullBright', 'UI Error', error));
}
