import { EasingType } from "@minecraft/server";

export const CONFIG_KEY = "zoom";

export const DEFAULT_CONFIG = Object.freeze({
  playSound: true,
});

export const ZOOM_CONFIG = Object.freeze({
  fov: 30,

  sound: {
    id: "item.spyglass.use",
    options: {
      volume: 0.8,
    },
  },

  camera: {
    easeTime: 0.25,
    easeType: EasingType.OutCubic,
  },

  effect: {
    id: "slowness",
    amplifier: 1,
    duration: 20 * 60 * 60,
    showParticles: false,
  },
});
