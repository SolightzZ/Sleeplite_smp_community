import { pcheck } from '../../../shared/player.js';
import { enqueuePlayerWelcome } from './processor.js';

export const playerSpawnWelcome = (event) => {
   const player = event.player;
   if (!pcheck(player)) return;
   enqueuePlayerWelcome(player);
};
