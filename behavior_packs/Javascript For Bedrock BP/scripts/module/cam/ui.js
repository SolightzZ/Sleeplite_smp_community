import { ActionFormData } from '@minecraft/server-ui';
import { logError } from '../../events/logger.js';
import { cache } from '../../shared/cache.js';

export function showCamMenu(event) {
   const player = event.source;
   if (!player) return;

   cache.playSound(player, 'ui.hardcore_enable');

   const form = new ActionFormData();
   form.title('FreeCam | มุมกล้องอิสระ');
   form.header('     Camera Mode');
   form.header('     Coming soon');
   form.divider();
   form.label('                @Sleeplite 2026');
   form.show(player).catch((error) => logError('Cam', 'showCamMenu', error));
}
