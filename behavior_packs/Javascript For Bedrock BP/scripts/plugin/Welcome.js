import { system, world } from '@minecraft/server';
import { logError } from '../router/core/logger.js';

const OBJECTIVE = 'Deaths';
const HEAD = '§e[+] Welcome to Sleeplite SMP Community';

const pendingWelcomes = [];

const getDeathObjective = () => {
   try {
      return world.scoreboard.getObjective(OBJECTIVE);
   } catch {
      return undefined;
   }
};

const getPlayerDeaths = (player, objective) => {
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

const showWelcome = (player, objective) => {
   const deaths = getPlayerDeaths(player, objective);
   player.sendMessage(`${HEAD}\n§7 Name: ${player.name}\n Deaths: ${deaths}`);
   player.onScreenDisplay.setTitle(player.name, {
      fadeInDuration: 0,
      fadeOutDuration: 50,
      stayDuration: 160,
      subtitle: ` ${deaths}`,
   });
   player.playSound('random.toast', { pitch: 1, volume: 1.0 });
};

export const processWelcomeQueue = () => {
   if (pendingWelcomes.length === 0) return;

   const now = system.currentTick;
   const objective = getDeathObjective();

   for (let i = 0; i < pendingWelcomes.length; i++) {
      const pending = pendingWelcomes[i];

      if (pending.runAtTick > now) continue;
      const player = pending.player;

      if (player && player.isValid) showWelcome(player, objective);
      const lastIndex = pendingWelcomes.length - 1;
      pendingWelcomes[i] = pendingWelcomes[lastIndex];
      pendingWelcomes.pop();
      i--;
   }
};

const enqueueWelcome = (player) => {
   pendingWelcomes.push({ player, runAtTick: system.currentTick + 150 });
};

export const playerSpawnWelcome = (event) => {
   if (!event.initialSpawn) return;
   const player = event.player;
   if (!player || !player.isValid) return;
   enqueueWelcome(player);
};
