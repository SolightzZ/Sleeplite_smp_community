import { tag, effect, time, level, particle } from "./const.js";

export const hasBright = (p) => p?.isValid() && p.hasTag(tag);

const addBright = (p) => {
  try {
    p.addTag(tag);
    p.addEffect(effect, time, {
      amplifier: level,
      showParticles: particle,
    });
  } catch (error) {
    console.log("addBright error:", error.message);
  }
};

const clearBright = (p) => {
  try {
    p.removeTag(tag);
    p.removeEffect(effect);
  } catch (error) {
    console.log("clearBright error:", error.message);
  }
};

export const setBright = (p, on) => {
  if (!p?.isValid() || on === hasBright(p)) return;

  on ? addBright(p) : clearBright(p);
  return on;
};

export const resetBright = (p) => {
  if (!p?.isValid()) return;
  clearBright(p);
};
