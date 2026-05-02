import { showMenu } from "./menu.js";
import { removeUser } from "./state.js";

function MagnetonUseItem({ source }) {
  showMenu(source);
}

function onLeave(event) {
  removeUser(event.playerId);
}

function magnetDie(event) {
  if (event.deadEntity?.typeId === "minecraft:player") {
    removeUser(event.deadEntity.id);
  }
}

export { MagnetonUseItem, onLeave, magnetDie };
