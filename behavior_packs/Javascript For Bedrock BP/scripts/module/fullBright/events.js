import { pcheck } from './../../shared/player.js';
import { resetBright } from './state.js';
import { showMenu } from './ui.js';

export function FullBrightUseItem({ source }) {
   if (pcheck(source)) {
      showMenu(source);
   }
}

export function onLeaveFullBright({ player }) {
   resetBright(player);
}

export function onPlayerSpawnFullBright({ player }) {
   resetBright(player);
}
