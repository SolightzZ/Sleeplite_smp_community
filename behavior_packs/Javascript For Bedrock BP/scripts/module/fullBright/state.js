import { tag, effect, time, level, particle } from "./const.js";

export const hasBright = (p) => p.hasTag(tag);

const addBright = (p) => {
  p.addTag(tag);
  p.addEffect(effect, time, {
    amplifier: level,
    showParticles: particle,
  });
};

const clearBright = (p) => {
  p.removeTag(tag);
  if (p.getEffect(effect)) {
    p.removeEffect(effect);
  }
};

export const setBright = (p, on) => {
  if (on === hasBright(p)) return;

  on ? addBright(p) : clearBright(p);
  return on;
};

export const resetBright = (p) => {
  if (!p) return;
  clearBright(p);
};
