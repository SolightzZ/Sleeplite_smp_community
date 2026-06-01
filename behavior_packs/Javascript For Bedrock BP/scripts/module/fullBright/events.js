import { world } from '@minecraft/server';
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

export function onLeaveFullBright(playerId) {
    if (!playerId) return;
    try {
        const player = world.getEntity(playerId);
        if (player?.typeId === 'minecraft:player' && player.isValid) {
            resetBright(player);
        }
    } catch (error) {
        console.error('[FullBright] onLeave Error:', error);
    }
}
