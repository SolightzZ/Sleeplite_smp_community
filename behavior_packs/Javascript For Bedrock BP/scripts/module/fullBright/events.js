import { resetBright } from './state.js';
import { showMenu } from './ui.js';

export function FullBrightUseItem({ source }) {
   if (source && source.isValid) {
      showMenu(source);
   }
}

export function onLeaveFullBright({ player }) {
   resetBright(player);
}

export function onPlayerSpawnFullBright({ player }) {
   resetBright(player);
}
