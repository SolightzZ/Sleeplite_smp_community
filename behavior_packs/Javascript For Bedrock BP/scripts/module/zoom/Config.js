import { EasingType, HudElement } from "@minecraft/server";

export const CONFIG_KEY = "zoom";

export const DEFAULT_CONFIG = Object.freeze({
  playSound: true,
  hideHud: true,
});

export const ZOOM_CONFIG = Object.freeze({
  sound: {
    id: "item.spyglass.use",
    options: {
      volume: 0.8,
    },
  },

  camera: {
    fov: 30,
    easeTime: 0.25,
    easeType: EasingType.OutCubic,
  },

  effect: {
    id: "slowness",
    amplifier: 1,
    duration: 20 * 60 * 60,
    showParticles: false,
  },

  hud: [HudElement.Crosshair, HudElement.ToolTips, HudElement.ItemText],
});
