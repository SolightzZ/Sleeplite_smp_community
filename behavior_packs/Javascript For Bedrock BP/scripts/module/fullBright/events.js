import { world, system } from "@minecraft/server";
import { resetBright } from "./state.js";
import { showMenu } from "./ui.js";

export const FullBrightUseItem = ({ source }) => {
  showMenu(source);
};

export const onDeadFullBright = ({ deadEntity }) => {
  if (deadEntity?.typeId === "minecraft:player") {
    resetBright(deadEntity);
  }
};

export const onLeaveFullBright = ({ playerId }) => {
  try {
    const p = world.getEntity(playerId);
    if (p?.typeId === "minecraft:player") {
      resetBright(p);
    }
  } catch {}
};
