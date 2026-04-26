import { system, world } from "@minecraft/server";
import { setting } from "./config.js";
import { countUser, hasTimer, setTimer, getTimer, clearTimer, hasUser } from "./state.js";
import { pullItem } from "./puller.js";

export function stopLoop() {
  if (hasTimer()) {
    system.clearRun(getTimer());
    clearTimer();
  }
}

export function startLoop() {
  if (hasTimer()) return;

  const id = system.runInterval(() => {
    try {
      if (countUser() === 0) {
        stopLoop();
        return;
      }

      for (const player of world.getAllPlayers()) {
        if (hasUser(player.id)) {
          pullItem(player);
        }
      }
    } catch (err) {
      console.warn(`Loop Error: ${err}`);
      stopLoop();
    }
  }, setting.speed);

  setTimer(id);
}
