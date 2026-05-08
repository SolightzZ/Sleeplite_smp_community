import { system, world } from "@minecraft/server";
import { setting } from "../config.js";
import { pullItem } from "./puller.js";
import {
  clearTimer,
  countUser,
  getTimer,
  getUserIds,
  hasTimer,
  removeUser,
  setTimer,
} from "./state.js";

export const stopLoop = () => {
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

      const allPlayers = world.getAllPlayers();
      const playerMap = new Map();
      for (let i = 0; i < allPlayers.length; i++) {
        playerMap.set(allPlayers[i].id, allPlayers[i]);
      }

      const ids = getUserIds();
      const toRemove = [];

      for (let i = 0; i < ids.length; i++) {
        const playerId = ids[i];
        const player = playerMap.get(playerId);
        if (player && player.isValid) {
          pullItem(player);
        } else {
          toRemove.push(playerId);
        }
      }

      for (let i = 0; i < toRemove.length; i++) {
        removeUser(toRemove[i]);
      }
    } catch (err) {
      console.error("[Magnet] Loop Error:", err);
      stopLoop();
    }
  }, setting.speed);

  setTimer(id);
}
