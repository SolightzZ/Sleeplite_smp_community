import { system } from "@minecraft/server";
import { setting } from "./config.js";
import { pullItem } from "./puller.js";
import {
  clearTimer,
  countUser,
  getTimer,
  getUserEntries,
  hasTimer,
  removeUser,
  setTimer,
} from "./state.js";

const stopLoop = () => {
  if (hasTimer()) {
    system.clearRun(getTimer());
    clearTimer();
  }
};

export function startLoop() {
  if (hasTimer()) return;

  const id = system.runInterval(() => {
    try {
      if (countUser() === 0) {
        stopLoop();
        return;
      }

      for (const [id, player] of getUserEntries()) {
        if (player && player.isValid) {
          pullItem(player);
        } else {
          removeUser(id);
        }
      }
    } catch (err) {
      console.warn(`Loop Error: ${err}`);
      stopLoop();
    }
  }, setting.speed);

  setTimer(id);
}
