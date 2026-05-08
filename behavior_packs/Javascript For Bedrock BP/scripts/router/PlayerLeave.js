import { system, world } from "@minecraft/server";

import { playerLeaveAfk } from "../module/AFKCinematic/index.js";
import { onLeaveFullBright } from "../module/fullBright/events.js";
import { JobLeave } from "../module/jobs/Job.js";
import { onLeave } from "../module/magNet/index.js";
import { clearVisualStateForPlayers } from "../module/protection/index.js";
import { flashLeave, handlerFlashlight } from "../module/flashlight/core/engine.js";




const PLAYER_LEAVE = [
  onLeaveFullBright,
  onLeave,
  clearVisualStateForPlayers,
  playerLeaveAfk,
  handlerFlashlight,
  flashLeave,
  JobLeave,
];

world.afterEvents.playerLeave.subscribe((event) => {
  try {
    const playerId = event.playerId;
    if (!playerId) return;

    system.run(() => {
      for (let i = 0; i < PLAYER_LEAVE.length; i++) {
        const fn = PLAYER_LEAVE[i];
        if (!fn) continue;

        fn(playerId);
      }
    });
  } catch (error) {
    console.warn("player_leave", error.message);
  }
});
