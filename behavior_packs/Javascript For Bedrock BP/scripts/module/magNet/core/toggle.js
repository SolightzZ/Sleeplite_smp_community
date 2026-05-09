import { MagnetConfig, MagnetText } from "../config.js";
import { startMagnetLoop } from "./loop.js";
import {
  addMagnetUser,
  countMagnetUsers,
  hasMagnetUser,
  removeMagnetUser,
} from "./state.js";

export const canUseMagnet = (player) =>
  player && player.isValid && player.location && player.dimension;

export const toggleMagnet = (player, turnOn) => {
  if (!canUseMagnet(player)) return;
  const id = player.id;

  if (turnOn) {
    if (countMagnetUsers() >= MagnetConfig.MAX_USERS && !hasMagnetUser(id)) {
      player.onScreenDisplay?.setActionBar(`§c${MagnetText.FULL}`);
      player.playSound("note.bass");
      return;
    }

    addMagnetUser(player);
    player.onScreenDisplay?.setActionBar(`§a${MagnetText.ON}`);
    player.playSound("random.orb", { pitch: 1.0 });
    startMagnetLoop();
  } else {
    removeMagnetUser(id);
    player.onScreenDisplay?.setActionBar(`§c${MagnetText.OFF}`);
    player.playSound("random.orb", { pitch: 0.5 });
  }
};
