import { system, EntityComponentTypes } from '@minecraft/server';
import { startGlobalSeatCheck } from './seat-checker.js';
import { SEAT_ENTITY_ID } from '../config.js';

export const activeSeats = new Map();

export const registerSeat = (entity, spawnLoc, dim, blockLoc) => {
    activeSeats.set(entity.id, {
        seatEntity: entity,
        dimension: dim,
        spawnLocation: { x: spawnLoc.x, y: spawnLoc.y, z: spawnLoc.z },
        blockLocation: blockLoc,
    });
    startGlobalSeatCheck();
};

export const spawnSeat = (dim, spawnLoc, rot, player, blockLoc) => {
    system.runTimeout(() => {
        try {
            const seat = dim.spawnEntity(SEAT_ENTITY_ID, spawnLoc);
            seat.setRotation(rot);
            seat.getComponent(EntityComponentTypes.Rideable)?.addRider(player);
            registerSeat(seat, spawnLoc, dim, blockLoc);
        } catch (error) {
            console.error('[ simpleSit ] spawnSeat: ' + error);
        }
    }, 5);
};
