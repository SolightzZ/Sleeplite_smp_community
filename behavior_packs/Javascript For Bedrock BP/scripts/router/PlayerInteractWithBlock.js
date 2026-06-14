import { world } from '@minecraft/server';
import { touch } from '../module/endPortalFrame/play.js';
import { onBlockEdit } from '../module/protection/core/events.js';
import { handleRepairAnvil } from '../plugin/AnvilRepair.js';
import { openDoor } from '../plugin/OpenDoor.js';
import { runEventHandlers, runEventHandlersWithCancel } from './utils.js';

const beforeHandlers = [touch, onBlockEdit, handleRepairAnvil];
const afterHandlers = [openDoor];

world.beforeEvents.playerInteractWithBlock.subscribe((ev) => {
   const player = ev.player;
   if (!player?.isValid) return;
   runEventHandlersWithCancel('PlayerInteractWithBlock', beforeHandlers, ev);
});

world.afterEvents.playerInteractWithBlock.subscribe((ev) => {
   const player = ev.player;
   if (!player?.isValid) return;
   runEventHandlers('PlayerInteractWithBlock', afterHandlers, ev);
});
