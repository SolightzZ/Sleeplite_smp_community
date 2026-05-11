import { ZOOM_CONFIG } from "./Config.js";

export function playZoomSound(player) {
  player.playSound(ZOOM_CONFIG.sound.id, ZOOM_CONFIG.sound.options);
}

export function applyZoom(player) {
  player.camera.setFov({
    fov: ZOOM_CONFIG.fov,
    easeOptions: ZOOM_CONFIG.camera,
  });

  player.addEffect(ZOOM_CONFIG.effect.id, ZOOM_CONFIG.effect.duration, {
    amplifier: ZOOM_CONFIG.effect.amplifier,
    showParticles: ZOOM_CONFIG.effect.showParticles,
  });
}

export function clearZoom(player) {
  player.camera.setFov({
    fov: 70,
  });

  player.removeEffect(ZOOM_CONFIG.effect.id);
}
