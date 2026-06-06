import { system } from '@minecraft/server';
import { dropHead } from './drop.js';
import { addDeath, initBoards } from './score.js';

const PLAYER_TYPE = 'minecraft:player';

export const DeathCounter = (event) => {
    const dead = event.deadEntity;
    if (!dead || dead.typeId !== PLAYER_TYPE) return;

    const dmg = event.damageSource;

    system.run(() => {
        if (!dead.isValid) return;
        dropHead(dead, dmg);
        addDeath(dead);
    });
};

system.run(initBoards);
