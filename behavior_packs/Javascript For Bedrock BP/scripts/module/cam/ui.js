import { ActionFormData } from '@minecraft/server-ui';
import { addSound } from '../../plugin/utils.js';

export function showCamMenu(event) {
   const player = event.source;
   addSound(player, 'ui.hardcore_enable');

   const form = new ActionFormData();
   form.title('FreeCam | มุมกล้องอิสระ');
   form.header('     Camera Mode');
   form.header('     Coming soon');
   form.divider();
   form.label('               @Sleeplite 2026');
   form.show(player);
}
