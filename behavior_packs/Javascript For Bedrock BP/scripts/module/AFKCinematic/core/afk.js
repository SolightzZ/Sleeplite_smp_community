import { HudVisibility } from '@minecraft/server';

import { CONFIG } from '../config.js';
import { cloneVec3, rotateRelInto, faceTargetInto, hashString } from '../utils/math.js';
import { pullCamera } from './block.js';
import { buildSequence } from './stateManager.js';
import { framePool } from './state.js';

const safeCameraClear = (player) => {
    if (!player || !player.isValid) return;

    try {
        player.camera.clear();
    } catch (error) {
        console.error(`[ AFKCinematic ] camera clear failed: ${error.message}`);
    }
};

const safeSetFov = (player, fov) => {
    if (!player || !player.isValid) return;

    try {
        player.camera.setFov({ fov });
    } catch (error) {
        console.error(`[ AFKCinematic ] set fov failed: ${error.message}`);
    }
};

export function startAfk(player, state, cinematicScheduler) {
    state.isAfk = true;
    state.idleTicks = state.idleSecondsCache;
    state.anchor = cloneVec3(player.location);
    state.baseYaw = player.getRotation().y;
    state.sequence = buildSequence(state.baseYaw, hashString(player.id));
    state.sequenceIndex = Math.floor(Math.random() * state.sequence.length);
    state.shotTicks = 0;
    state.waveClock = Math.random() * Math.PI * 2;
    state.warningShown = false;

    player.onScreenDisplay.setHudVisibility(HudVisibility.Hide);
    player.camera.setCamera('minecraft:first_person', {
        easeOptions: { easeType: 'Linear', time: 0.2 },
    });
    safeSetFov(player, CONFIG.cinematicFov);

    cinematicScheduler.enqueue(player.id);
}

export function stopAfk(player, state, cinematicScheduler) {
    state.isAfk = false;
    state.idleTicks = 0;
    state.warningShown = false;

    cinematicScheduler.dequeue(player.id);

    player.onScreenDisplay.setHudVisibility(HudVisibility.Reset);
    safeCameraClear(player);
}

export function getCameraFrame(player, state) {
    const shot = state.sequence[state.sequenceIndex];
    const progress = shot.duration <= 0 ? 0 : state.shotTicks / shot.duration;
    const breath = Math.sin(state.waveClock + progress * Math.PI * 2);
    const drift = Math.cos(state.waveClock * 0.7 + progress * Math.PI * 2);

    const desiredOff = framePool.desiredOff;
    rotateRelInto(desiredOff, shot.yaw, shot.distance, drift * shot.slide, shot.height + breath * shot.bob);

    const desired = framePool.desired;
    desired.x = state.anchor.x + desiredOff.x;
    desired.y = state.anchor.y + desiredOff.y;
    desired.z = state.anchor.z + desiredOff.z;

    const targetOff = framePool.targetOff;
    rotateRelInto(targetOff, state.baseYaw, shot.targetForward, shot.targetRight, shot.targetUp);

    const loc = player.location;
    const target = framePool.target;
    target.x = loc.x + targetOff.x;
    target.y = loc.y + targetOff.y;
    target.z = loc.z + targetOff.z;

    const position = pullCamera(player.dimension, target, desired, shot.height);
    const rotation = faceTargetInto(framePool.rotation, position, target);

    return { position, rotation };
}
