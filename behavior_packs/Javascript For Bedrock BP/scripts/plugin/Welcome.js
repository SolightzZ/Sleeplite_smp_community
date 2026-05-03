import { system, world } from "@minecraft/server";

const stat = "Deaths";
const head = "§e[!] Welcome to Sleeplite SMP Season 1";
const wait = 150;

const read = (boy) => {
  const board = world.scoreboard.getObjective(stat);
  if (!board) return 0;
  const id = boy.scoreboardIdentity;
  if (!id) return 0;
  let nums = board.getScore(id) ?? 0;
  if (!board.hasParticipant(id)) {
    board.setScore(id, 0);
  }
  return nums;
};

const showWelcome = (boy) => {
  const dead = read(boy);

  boy.sendMessage(`${head}\n§7 Name: ${boy.name}\n Deaths: ${dead}`);

  boy.onScreenDisplay.setTitle(boy.name, {
    fadeInDuration: 0,
    fadeOutDuration: 50,
    stayDuration: 160,
    subtitle: `Deaths: ${dead}`,
  });
  boy.playSound("random.toast", { pitch: 1, volume: 1.5 });
};

function playerSpawnWelcome(event) {
  try {
    const boy = event.player;
    console.log("boy:", boy.name);
    const isNew = event.initialSpawn;

    if (!isNew) return;

    system.runTimeout(() => {
      showWelcome(boy);
    }, wait);
  } catch (error) {
    console.warn("player_spawn_welcome", error.message);
  }
}

export { playerSpawnWelcome };
