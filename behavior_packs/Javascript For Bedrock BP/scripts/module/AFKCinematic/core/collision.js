import { isPassable } from "../utils/block";
import { dist3, lerp3 } from "../utils/vector";
import { CONFIG } from "../config";

export function liftAbove(dim, pos, skipLift = false) {
  if (skipLift) return pos;
  let p = { x: pos.x, y: pos.y, z: pos.z };
  for (let i = 0; i < 6; i++) {
    if (isPassable(dim, p)) return p;
    p.y += 0.5;
  }
  return p;
}

export function pullCamera(dim, focus, desired, shotH = 0) {
  const travel = dist3(focus, desired);
  if (travel <= 0.001) return liftAbove(dim, desired, shotH > 5);

  const steps = Math.min(24, Math.max(2, Math.ceil(travel / CONFIG.collisionStep)));
  let safe = { x: focus.x, y: focus.y, z: focus.z };

  for (let i = 1; i <= steps; i++) {
    const sample = lerp3(focus, desired, i / steps);
    if (!isPassable(dim, sample)) {
      const retreat = Math.min(1, CONFIG.collisionBuffer / travel);
      return liftAbove(dim, lerp3(safe, focus, retreat), shotH > 5);
    }
    safe = sample;
  }
  return liftAbove(dim, desired, shotH > 5);
}
