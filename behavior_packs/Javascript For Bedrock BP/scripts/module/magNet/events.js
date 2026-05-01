import { showMenu } from "./menu.js";
import { removeUser } from "./state.js";

export function MagnetonUseItem({ source }) {
  showMenu(source);
}

export function onLeave(event) {
  removeUser(event.playerId);
}

export function magnetDie(event) {
  if (event.deadEntity?.typeId === "minecraft:player") {
    removeUser(event.deadEntity.id);
  }
}
