import { system } from "@minecraft/server";
import { inventorys } from "./rules.js";

export const see = (player, thing) => {
  if (!player || !player.isValid) return false;

  const bag = player.getComponent(inventorys)?.container;
  if (!bag) return false;

  const size = bag.size;
  for (let i = 0; i < size; i++) {
    const item = bag.getItem(i);
    if (item && item.typeId === thing) return true;
  }

  return false;
};

export const eat = (player, thing) => {
  if (!player || !player.isValid) return;

  system.run(() => {
    if (!player.isValid) return;

    const bag = player.getComponent(inventorys)?.container;
    if (!bag) return;

    const size = bag.size;
    for (let i = 0; i < size; i++) {
      const item = bag.getItem(i);
      if (item && item.typeId === thing) {
        if (item.amount > 1) {
          item.amount--;
          bag.setItem(i, item);
        } else {
          bag.setItem(i, undefined);
        }
        break;
      }
    }
  });
};

export const hit = (player, pain) => {
  if (!player || !player.isValid || pain <= 0) return;

  system.run(() => {
    if (player.isValid) player.applyDamage(pain);
  });
};

export const say = (player, msg) => {
  if (!player || !player.isValid) return;

  system.run(() => {
    if (!player.isValid) return;
    player.onScreenDisplay?.setActionBar(msg);
  });
};
