import { system, world } from "@minecraft/server";

const OBJECTIVE = "Deaths";
const HEAD = "§e[!] Welcome to Sleeplite SMP Season 1";
const DELAY = 150;

const getDeaths = (player) => {
  const board = world.scoreboard.getObjective(OBJECTIVE);
  if (!board) return 0;
  const id = player.scoreboardIdentity;
  if (!id) return 0;
  if (!board.hasParticipant(id)) {
    board.setScore(id, 0);
    return 0;
  }
  return board.getScore(id) ?? 0;
};

const showWelcome = (player) => {
  const dead = getDeaths(player);
  player.sendMessage(`${HEAD}\n§7 Name: ${player.name}\n Deaths: ${dead}`);
  player.onScreenDisplay.setTitle(player.name, {
    fadeInDuration: 0,
    fadeOutDuration: 50,
    stayDuration: 160,
    subtitle: `Deaths: ${dead}`,
  });
  player.playSound("random.toast", { pitch: 1, volume: 1.5 });
};

export const playerSpawnWelcome = (event) => {
  if (!event.initialSpawn) return;
  const player = event.player;
  if (!player?.isValid) return;

  system.runTimeout(() => {
    if (!player.isValid) return;
    showWelcome(player);
  }, DELAY);
};
