import { system } from "@minecraft/server";

import { onLeaveFullBright } from "./FullBright/events.js";
import { playerLeaveCamera } from "./Camera/system.js";
import { onLeave } from "./magnet/events.js";
import { clearVisualStateForPlayers } from "./Protection/system.js";

const PLAYER_LEAVE = [onLeaveFullBright, playerLeaveCamera, onLeave, clearVisualStateForPlayers];

export function onPlayerLeave(event) {
  const playerId = event;
  system.run(() => {
    PLAYER_LEAVE.forEach((actionFn) => {
      actionFn(playerId);
    });
  });
}
console.warn("[world afterEvents playerLeave] loaded successfully");
