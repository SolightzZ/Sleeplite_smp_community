import { SHOT_LIBRARY } from "../data/shots";
import { normalizeYaw } from "../utils/math";

export function buildSequence(baseYaw, seed) {
  const start = seed % SHOT_LIBRARY.length;
  return SHOT_LIBRARY.map((t, i) => {
    const mirror = ((seed >> (i % 8)) & 1) === 1 ? -1 : 1;
    return {
      yaw: normalizeYaw(baseYaw + (t.yawOffset || 0) * mirror),
      distance: t.distance,
      height: t.height,
      slide: t.slide,
      bob: t.bob,
      duration: t.duration,
      targetUp: t.targetUp,
      targetForward: t.targetForward ?? 0,
      targetRight: (t.targetRight ?? 0) * mirror,
    };
  });
}
