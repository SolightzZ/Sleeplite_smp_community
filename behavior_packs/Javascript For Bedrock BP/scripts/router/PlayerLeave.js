import { system, world } from "@minecraft/server";

import { onLeaveFullBright } from "../module/fullBright/events.js";
import { onLeave } from "../module/magNet/events.js";
import { clearVisualStateForPlayers } from "../module/protection/system.js";
import { flashLeave, handlerFlashlight } from "../plugin/Flashlight.js";
import { playerLeaveAfk } from "../module/AFKCinematic/index.js";
import { JobLeave } from "../module/jobs/Job.js";

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
