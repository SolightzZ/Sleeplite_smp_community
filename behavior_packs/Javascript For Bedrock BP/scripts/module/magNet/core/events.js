import { removeMagnetUser } from './state.js';
import { showMagnetMenu } from '../ui/menu.js';
import { pcheck } from './../../../shared/player.js';

export const onMagnetUse = ({ source }) => {
    if (pcheck(source)) showMagnetMenu(source);
};

export const onMagnetPlayerLeave = (playerId) => removeMagnetUser(playerId);

export const onMagnetPlayerDie = (event) => {
    if (event.deadEntity?.typeId === 'minecraft:player') {
        removeMagnetUser(event.deadEntity.id);
    }
};
