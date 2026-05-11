import { system, world } from "@minecraft/server";
import { playerLeaveAfk } from "../module/AFKCinematic/index.js";
import {
  flashLeave,
  handlerFlashlight,
} from "../module/flashlight/core/engine.js";
import { onLeaveFullBright } from "../module/fullBright/events.js";
import { onJobPlayerLeave } from "../module/jobs/Job.js";
import { onMagnetPlayerLeave } from "../module/magNet/index.js";
import { chatRankPlayerLeave } from "../module/nameteg/index.js";
import { onPlayerLeave } from "../module/protection/index.js";
import { zoomPlayerLeave } from "../module/zoom/index.js";

const handlers = [
  onLeaveFullBright,
  onMagnetPlayerLeave,
  onPlayerLeave,
  playerLeaveAfk,
  handlerFlashlight,
  flashLeave,
  onJobPlayerLeave,
  chatRankPlayerLeave,
  zoomPlayerLeave,
];

world.afterEvents.playerLeave.subscribe((ev) => {
  try {
    const id = ev.playerId;
    if (!id) return;

    system.run(() => {
      const len = handlers.length;
      for (let i = 0; i < len; i++) {
        const fn = handlers[i];
        if (fn) fn(id);
      }
    });
  } catch (e) {
    console.warn("[ PlayerLeave ] player_leave", e.message);
  }
});
