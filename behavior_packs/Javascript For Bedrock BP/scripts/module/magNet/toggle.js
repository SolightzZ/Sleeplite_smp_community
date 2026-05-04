import { setting } from "./config.js";
import { startLoop } from "./loop.js";
import { addUser, countUser, hasUser, removeUser } from "./state.js";

function canUse(player) {
  return player && player.isValid && player.location && player.dimension;
}

function toggle(player, turnOn) {
  if (!canUse(player)) return;
  const id = player.id;

  if (turnOn) {
    if (countUser() >= setting.maxPeople && !hasUser(id)) {
      player.onScreenDisplay.setActionBar(`§c${setting.text.full}`);
      player.playSound("note.bass");
      return;
    }

    addUser(player);
    player.onScreenDisplay.setActionBar(`§a${setting.text.on}`);
    player.playSound("random.orb", { pitch: 1.0 });
    startLoop();
  } else {
    removeUser(id);
    player.onScreenDisplay.setActionBar(`§c${setting.text.off}`);
    player.playSound("random.orb", { pitch: 0.5 });
  }
}

export { canUse, toggle };
