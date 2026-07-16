import { world } from '@minecraft/server';
import { logError } from '../../../events/logger.js';
import { CFG } from '../config.js';

export const getDeathObjective = () => {
   try {
      return world.scoreboard.getObjective(CFG.deathObjective);
   } catch {
      return undefined;
   }
};

export const getPlayerDeaths = (player, objective) => {
   if (!objective) return 0;

   const identity = player.scoreboardIdentity;
   if (!identity) return 0;

   try {
      if (!objective.hasParticipant(identity)) {
         objective.setScore(identity, 0);
         return 0;
      }

      return objective.getScore(identity) || 0;
   } catch (error) {
      logError('Welcome', 'getPlayerDeaths', error);
      return 0;
   }
};
