import { world } from '@minecraft/server';
import { logError } from '../../router/core/logger.js';
import { boardA, boardB } from './data.js';

let objA, objB;

const getBoard = (name) => {
   return world.scoreboard.getObjective(name) || world.scoreboard.addObjective(name, name);
};

export const addDeath = (player) => {
   if (!player || !player.isValid) return;
   if (!objA || !objB) initBoards();
   if (!objA || !objB) return;

   try {
      objA.addScore(player, 1);
      objB.addScore(`*${player.name}`, 1);
   } catch (error) {
      logError('dropheads', 'addDeath', error);
   }
};

export const initBoards = () => {
   try {
      objA = getBoard(boardA);
      objB = getBoard(boardB);
   } catch (error) {
      logError('dropheads', 'initBoards', error);
   }
};
