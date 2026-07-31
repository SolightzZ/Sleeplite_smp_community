import { playerTimeManager } from './PlayerTimeManager.js';

export const playerTimeJoin = (event) => playerTimeManager.onJoin(event.player);

export const playerTimeLeave = (event) => playerTimeManager.onLeave(event.player);

export const playerTimeInit = () => playerTimeManager.initOnline();
