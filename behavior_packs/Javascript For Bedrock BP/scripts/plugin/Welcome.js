import { system, world } from "@minecraft/server";

const OBJECTIVE = "Deaths";
const HEAD = "§e[!] Welcome to Sleeplite SMP Season 1";
const DELAY = 150;
const LOOP_DELAY = 5;
const pendingWelcomes = [];
let welcomeLoopId;

const getDeathObjective = () => world.scoreboard.getObjective(OBJECTIVE);

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
  } catch {
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
  player.playSound("random.toast", { pitch: 1, volume: 1.5 });
};

const processWelcomeQueue = () => {
  if (pendingWelcomes.length === 0) {
    if (welcomeLoopId !== undefined) {
      system.clearRun(welcomeLoopId);
      welcomeLoopId = undefined;
    }
    return;
  }

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

const ensureWelcomeLoop = () => {
  if (welcomeLoopId !== undefined) return;
  welcomeLoopId = system.runInterval(processWelcomeQueue, LOOP_DELAY);
};

const enqueueWelcome = (player) => {
  pendingWelcomes.push({ player, runAtTick: system.currentTick + DELAY });
  ensureWelcomeLoop();
};

export const playerSpawnWelcome = (event) => {
  if (!event.initialSpawn) return;
  const player = event.player;
  if (!player || !player.isValid) return;
  enqueueWelcome(player);
};
