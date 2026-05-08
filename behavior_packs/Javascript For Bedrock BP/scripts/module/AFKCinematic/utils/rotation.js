import { normalizeYaw } from "./math";

export const rotateRel = (yaw, fwd, right, up = 0) => {
  const r = (yaw * Math.PI) / 180;
  return {
    x: -Math.sin(r) * fwd + Math.cos(r) * right,
    y: up,
    z: Math.cos(r) * fwd + Math.sin(r) * right,
  };
};

export const faceTarget = (from, to) => {
  const dx = to.x - from.x, dy = to.y - from.y, dz = to.z - from.z;
  const horiz = Math.max(0.001, Math.sqrt(dx * dx + dz * dz));
  return {
    pitch: -((Math.atan2(dy, horiz) * 180) / Math.PI),
    yaw: normalizeYaw(-((Math.atan2(dx, dz) * 180) / Math.PI)),
  };
};
