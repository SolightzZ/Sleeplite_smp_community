import { world, system } from '@minecraft/server';
import { SEAT_ENTITY_ID } from '../config.js';

const dims = ['minecraft:overworld', 'minecraft:nether', 'minecraft:the_end'];

export const clearSeatsInDimension = (dimName) => {
    try {
        const dim = world.getDimension(dimName);
        const entities = dim.getEntities({ type: SEAT_ENTITY_ID });
        for (const entity of entities) {
            entity.remove();
        }
    } catch (error) {
        console.error('[ simpleSit ] clearSeatsInDimension: ' + error);
    }
};

export const initCleanup = () => {
    system.run(() => {
        system.runTimeout(() => {
            for (const dimName of dims) {
                clearSeatsInDimension(dimName);
            }
        }, 1);
    });
};
