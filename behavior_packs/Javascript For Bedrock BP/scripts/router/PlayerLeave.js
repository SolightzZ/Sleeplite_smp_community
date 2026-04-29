import { system } from "@minecraft/server";

import { onLeaveFullBright } from "../module/fullBright/events.js";
import { onLeave } from "../module/magNet/events.js";
import { clearVisualStateForPlayers } from "../module/protection/system.js";
import { playerLeaveAfk } from "../plugin/AFK_Cinematic.js";

const PLAYER_LEAVE = [
  onLeaveFullBright,
  onLeave,
  clearVisualStateForPlayers,
  playerLeaveAfk,
];

export function onPlayerLeave(event) {
  const playerId = event.playerId;
  if (!playerId) return;

  system.run(() => {
    for (let i = 0; i < PLAYER_LEAVE.length; i++) {
      const fn = PLAYER_LEAVE[i];
      if (!fn) continue;

      fn(playerId);
    }
  });
}

world.afterEvents.playerLeave.subscribe(onPlayerLeave);
