import { resetBright } from './state.js';
import { showMenu } from './ui.js';

export function FullBrightUseItem({ source }) {
    if (source && source.isValid) {
        showMenu(source);
    }
}

export function onDeadFullBright({ deadEntity }) {
    if (deadEntity?.typeId === 'minecraft:player' && deadEntity.isValid) {
        resetBright(deadEntity);
    }
}

export function onLeaveFullBright(event) {
    const player = event.player;
    if (player?.isValid) {
        resetBright(player);
    }
}
