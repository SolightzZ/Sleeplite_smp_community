import { system } from '@minecraft/server';
import { pcheck } from '../../../shared/player.js';
import { CFG } from '../config.js';
import { getDeathObjective, getPlayerDeaths } from './scoreboard.js';
import { enqueueWelcome, popDueWelcomes } from './state.js';
import { showWelcome } from './display.js';
import { getPlayerDayNumber } from './dayCounter.js';

export const enqueuePlayerWelcome = (player) => {
   enqueueWelcome(player, system.currentTick + CFG.queueDelayTicks);
};

export const processWelcomeQueue = () => {
   const due = popDueWelcomes(system.currentTick);
   if (due.length === 0) return;

   const objective = getDeathObjective();

   for (const player of due) {
      if (!pcheck(player)) continue;
      showWelcome(player, getPlayerDeaths(player, objective), getPlayerDayNumber(player));
   }
};
