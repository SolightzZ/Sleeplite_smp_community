import { world, system } from "@minecraft/server";

const stat = "Deaths";
const head = "§e[!] Welcome to Sleeplite SMP Season 1";
const wait = 150;

function read(boy) {
  const board = world.scoreboard.getObjective(stat);
  if (!board) return 0;
  const id = boy.scoreboardIdentity;
  if (!id) return 0;
  let nums = board.getScore(id) ?? 0;
  if (!board.hasParticipant(id)) {
    board.setScore(id, 0);
  }

  return nums;
}

function showWelcome(boy) {
  const dead = read(boy);

  boy.sendMessage(`${head}\n§7 Name: ${boy.name}\n Deaths: ${dead}`);

  boy.onScreenDisplay.setTitle(boy.name, {
    fadeInDuration: 0,
    fadeOutDuration: 50,
    stayDuration: 160,
    subtitle: `Deaths: ${dead}`,
  });
  boy.playSound("random.toast", { pitch: 1, volume: 1.5 });
}

world.afterEvents.playerSpawn.subscribe((evt) => {
  const boy = evt.player;
  const isNew = evt.initialSpawn;

  if (!isNew) return;

  system.runTimeout(() => {
    showWelcome(boy);
  }, wait);
});

console.warn("Welcome loaded successfully");
