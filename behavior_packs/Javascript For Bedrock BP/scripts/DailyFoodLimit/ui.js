import { system, world } from "@minecraft/server";
import { colors } from "./constants.js";

export function warn(player, food, max) {
  const msg = `${colors.red}Limit: ${food} (${max}/${max})`;

  system.run(() => {
    player.onScreenDisplay.setActionBar(msg);
    player.playSound("note.bass", { volume: 0.5 });
  });
}

export function success(player, food, now, max) {
  const msg = `${colors.green}+ ${colors.gray}(${now}/${max})`;
  player.onScreenDisplay.setActionBar(msg);
}

export function playmovie(day) {
  const dayStr = String(day);
  const frames = [];

  frames.push(" ", "-", "--", "----");

  for (let i = 1; i <= dayStr.length; i++) {
    frames.push(`-- ${dayStr.slice(0, i)} --`);
  }

  for (let i = dayStr.length - 1; i >= 1; i--) {
    frames.push(`-- ${dayStr.slice(0, i)} --`);
  }

  frames.push("----", "--", "-", " ");

  const players = world.getPlayers();
  const fullFrame = `-- ${dayStr} --`;
  let index = 0;

  const run = () => {
    if (index >= frames.length) return;

    const text = frames[index];
    const isFull = text === fullFrame;
    const delay = isFull ? 60 : 6;
    const clicks = "random.click";

    for (const p of players) {
      p.onScreenDisplay.setActionBar(text);
      p.playSound(clicks, { volume: 0.5 });
    }

    index++;
    system.runTimeout(run, delay);
  };

  run();
}
