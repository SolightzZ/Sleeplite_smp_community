import { showMenu } from "./ui/menu.js";
import { removeUser } from "./core/state.js";

export function MagnetonUseItem({ source }) {
  if (source && source.isValid) {
    showMenu(source);
  }
}

export function onLeave(event) {
  removeUser(event.playerId);
}

export function magnetDie(event) {
  if (event.deadEntity?.typeId === "minecraft:player") {
    removeUser(event.deadEntity.id);
  }
}
