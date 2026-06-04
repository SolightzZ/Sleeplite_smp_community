import { CONFIG, SHOT_LIBRARY } from '../config.js';
import { cloneVec3, cloneVec2, angleDiff, normalizeYaw } from '../utils/math.js';
import { playerStates, blockCache } from './state.js';

export function ensureState(player) {
    let state = playerStates.get(player.id);
    if (state) return state;

    const loc = player.location;
    const rot = player.getRotation();

    state = {
        lastPosition: cloneVec3(loc),
        lastRotation: cloneVec2(rot),
        dimensionId: player.dimension.id,
        idleTicks: 0,
        idleSeconds: CONFIG.defaultIdleSeconds,
        idleSecondsCache: CONFIG.defaultIdleSeconds,
        warningSecondsCache: CONFIG.warningSeconds,
        warningShown: false,
        isAfk: false,
        anchor: cloneVec3(loc),
        baseYaw: rot.y,
        sequence: [],
        sequenceIndex: -1,
        shotTicks: 0,
        waveClock: Math.random() * Math.PI * 2,
    };

    playerStates.set(player.id, state);
    return state;
}

export function refreshBaseline(player, state) {
    const newDimId = player.dimension.id;
    if (newDimId !== state.dimensionId) {
        const prefix = state.dimensionId + ':';
        for (const key of blockCache.keys()) {
            if (key.startsWith(prefix)) blockCache.delete(key);
        }
    }

    state.lastPosition = cloneVec3(player.location);
    state.lastRotation = cloneVec2(player.getRotation());
    state.dimensionId = newDimId;
}

export function hasMoved(player, state) {
    if (player.dimension.id !== state.dimensionId) return true;
    const loc = player.location;
    const rot = player.getRotation();
    const tol = CONFIG.movementTolerance;

    return (
        Math.abs(loc.x - state.lastPosition.x) > tol ||
        Math.abs(loc.y - state.lastPosition.y) > tol ||
        Math.abs(loc.z - state.lastPosition.z) > tol ||
        angleDiff(rot.y, state.lastRotation.y) > CONFIG.rotationTolerance ||
        Math.abs(rot.x - state.lastRotation.x) > CONFIG.rotationTolerance
    );
}

export function buildSequence(baseYaw, seed) {
    return SHOT_LIBRARY.map((shot, i) => {
        const mirror = ((seed >> (i % 8)) & 1) === 1 ? -1 : 1;

        return {
            yaw: normalizeYaw(baseYaw + (shot.yawOffset || 0) * mirror),
            distance: shot.distance,
            height: shot.height,
            slide: shot.slide,
            bob: shot.bob,
            duration: shot.duration,
            targetUp: shot.targetUp,
            targetForward: shot.targetForward ?? 0,
            targetRight: (shot.targetRight ?? 0) * mirror,
        };
    });
}
