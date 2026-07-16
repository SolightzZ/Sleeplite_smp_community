import { HudVisibility } from '@minecraft/server';
import { ZOOM_CONFIG } from './Config.js';
import { cache } from '../../shared/cache.js';
import { addSound } from '../../shared/utils.js';

export function playZoomSound(player) {
    addSound(player, ZOOM_CONFIG.sound.id, ZOOM_CONFIG.sound.options);
}

export function applyZoom(player, config) {
    player.camera.setFov({
        fov: ZOOM_CONFIG.camera.fov,
        easeOptions: ZOOM_CONFIG.camera,
    });

    cache.addEffect(player, ZOOM_CONFIG.effect.id, ZOOM_CONFIG.effect.duration, {
        amplifier: ZOOM_CONFIG.effect.amplifier,
        showParticles: ZOOM_CONFIG.effect.showParticles,
    });

    if (config.hideHud) {
        player.onScreenDisplay.setHudVisibility(HudVisibility.Hide, ZOOM_CONFIG.hud);
    }
}

export function clearZoom(player, config) {
    player.camera.clear();

    player.removeEffect(ZOOM_CONFIG.effect.id);

    if (config.hideHud) {
        player.onScreenDisplay.setHudVisibility(HudVisibility.Reset, ZOOM_CONFIG.hud);
    }
}
