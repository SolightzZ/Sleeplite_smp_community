import { Player, world } from "@minecraft/server";
import { resetBright } from "./state.js";
import { showMenu } from "./ui.js";

export const FullBrightUseItem = ({ source }) => {
  if (!source?.isValid()) return;
  showMenu(source);
};

export const onDeadFullBright = ({ deadEntity }) => {
  if (deadEntity?.isValid() && deadEntity?.typeId === "minecraft:player") {
    resetBright(deadEntity);
  }
};

export const onLeaveFullBright = ({ playerId }) => {
  try {
    const p = world.getEntity(playerId);
    if (p?.isValid() && p?.typeId === "minecraft:player") {
      resetBright(p);
    }
  } catch (error) {
    console.log("onLeaveFullBright error:", error.message);
  }
};
