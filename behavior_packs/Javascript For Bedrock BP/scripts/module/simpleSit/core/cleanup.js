import { world, system } from '@minecraft/server';
import { SEAT_ENTITY_ID } from '../constants.js';

const dims = ['minecraft:overworld', 'minecraft:nether', 'minecraft:the_end'];

export const clearSeatsInDimension = (dimName) => {
    try {
        const dim = world.getDimension(dimName);
        const entities = dim.getEntities({ type: SEAT_ENTITY_ID });
        const len = entities.length;
        for (let i = 0; i < len; i++) {
            entities[i].remove();
        }
    } catch (error) {
        console.error('[ simpleSit ] clearSeatsInDimension: ' + error);
    }
};

export const initCleanup = () => {
    system.run(() => {
        system.runTimeout(() => {
            const len = dims.length;
            for (let i = 0; i < len; i++) {
                clearSeatsInDimension(dims[i]);
            }
        }, 1);
    });
};
