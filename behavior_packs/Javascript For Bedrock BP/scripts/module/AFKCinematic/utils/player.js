import { angleDiff } from "./math";
import { CONFIG } from "../config";

export function hasMoved(player, s) {
  if (player.dimension.id !== s.dimensionId) return true;
  const loc = player.location;
  const rot = player.getRotation();

  return (
    Math.abs(loc.x - s.lastPosition.x) > CONFIG.movementTolerance ||
    Math.abs(loc.y - s.lastPosition.y) > CONFIG.movementTolerance ||
    Math.abs(loc.z - s.lastPosition.z) > CONFIG.movementTolerance ||
    angleDiff(rot.y, s.lastRotation.y) > CONFIG.rotationTolerance ||
    Math.abs(rot.x - s.lastRotation.x) > CONFIG.rotationTolerance
  );
}

export function refreshBaseline(player, s) {
  const loc = player.location;
  const rot = player.getRotation();
  s.lastPosition.x = loc.x; s.lastPosition.y = loc.y; s.lastPosition.z = loc.z;
  s.lastRotation.x = rot.x; s.lastRotation.y = rot.y;
  s.dimensionId = player.dimension.id;
}
