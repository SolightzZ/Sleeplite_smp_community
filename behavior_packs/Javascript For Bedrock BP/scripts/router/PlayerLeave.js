import { world } from '@minecraft/server';
import { playerLeaveAfk } from '../module/AFKCinematic/core/poller.js';
import { flashLeave } from '../module/flashlight/core/engine.js';
import { onLeaveFullBright } from '../module/fullBright/events.js';
import { onJobPlayerLeave } from '../module/jobs/Job.js';
import { onMagnetPlayerLeave } from '../module/magNet/core/events.js';
import { zoomPlayerLeave } from '../module/zoom/core.js';
import { onPlayerLeave } from '../module/protection/core/events.js';
import { runEventHandlers } from './utils.js';

const handlersafter = [
   onMagnetPlayerLeave,
   playerLeaveAfk,
   flashLeave,
   onJobPlayerLeave,
   zoomPlayerLeave,
];

const handlersbefore = [onLeaveFullBright, onPlayerLeave];

world.afterEvents.playerLeave.subscribe((event) => {
   const id = event.playerId;
   runEventHandlers('PlayerLeave', handlersafter, id);
});

world.beforeEvents.playerLeave.subscribe((event) => {
   runEventHandlers('PlayerLeave', handlersbefore, event);
});
