import { world } from "@minecraft/server";
import { resetBright } from "./state.js";
import { showMenu } from "./ui.js";

function FullBrightUseItem({ source }) {
  showMenu(source);
}

function onDeadFullBright({ deadEntity }) {
  if (deadEntity?.typeId === "minecraft:player") {
    resetBright(deadEntity);
  }
}

function onLeaveFullBright(playerId) {
  try {
    const player = world.getEntity(playerId);
    if (player?.typeId === "minecraft:player") {
      resetBright(player);
      resetBright(player.name);
    }
  } catch (error) {
    console.error("onLeaveFullBright:", error);
  }
}

export { FullBrightUseItem, onDeadFullBright, onLeaveFullBright };
