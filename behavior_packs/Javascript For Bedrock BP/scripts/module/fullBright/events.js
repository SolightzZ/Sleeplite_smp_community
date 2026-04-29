import { world, system } from "@minecraft/server";
import { resetBright } from "./state.js";
import { showMenu } from "./ui.js";

export function FullBrightUseItem({ source }) {
  showMenu(source);
}

export function onDeadFullBright({ deadEntity }) {
  if (deadEntity?.typeId === "minecraft:player") {
    resetBright(deadEntity);
  }
}

export function onLeaveFullBright({ playerId }) {
  try {
    const p = world.getEntity(playerId);
    if (p?.typeId === "minecraft:player") {
      resetBright(p);
    }
  } catch {}
}
