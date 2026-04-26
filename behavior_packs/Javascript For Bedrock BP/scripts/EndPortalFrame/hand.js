import { system } from "@minecraft/server";
import { inventorys } from "./rules.js";

export function see(player, thing) {
  const bag = player.getComponent(inventorys).container;
  for (let i = 0; i < bag.size; i++) {
    const item = bag.getItem(i);
    if (item && item.typeId === thing) return true;
  }
  return false;
}

export function eat(player, thing) {
  system.run(() => {
    const bag = player.getComponent(inventorys).container;
    for (let i = 0; i < bag.size; i++) {
      const item = bag.getItem(i);
      if (item && item.typeId === thing) {
        if (item.amount > 1) {
          item.amount -= 1;
          bag.setItem(i, item);
        } else {
          bag.setItem(i, undefined);
        }
        break;
      }
    }
  });
}

export function hit(player, pain) {
  if (pain <= 0) return;
  system.run(() => {
    player.applyDamage(pain);
  });
}

export function say(player, msg) {
  system.run(() => {
    player.onScreenDisplay.setActionBar(msg);
  });
}
