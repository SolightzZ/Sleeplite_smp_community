import { CONFIG, SHOT_LIBRARY } from "../config.js";
import { playerStates, blockCache } from "./state.js";
import { cloneVec3, cloneVec2, angleDiff, normalizeYaw } from "../utils/math.js";

export function ensureState(player) {
  let s = playerStates.get(player.id);
  if (s) return s;

  const loc = player.location;
  const rot = player.getRotation();

  s = {
    lastPosition: cloneVec3(loc),
    lastRotation: cloneVec2(rot),
    dimensionId: player.dimension.id,
    idleTicks: 0,
    idleSeconds: CONFIG.defaultIdleSeconds,
    idleSecondsCache: CONFIG.defaultIdleSeconds,
    warningSecondsCache: CONFIG.warningSeconds,
    warningShown: false,
    isAfk: false,
    anchor: cloneVec3(loc),
    baseYaw: rot.y,
    sequence: [],
    sequenceIndex: 0,
    shotTicks: 0,
    waveClock: Math.random() * Math.PI * 2,
  };

  playerStates.set(player.id, s);
  return s;
}

export function refreshBaseline(player, s) {
  const newDimId = player.dimension.id;
  if (newDimId !== s.dimensionId) {
    const prefix = s.dimensionId + ":";
    for (const key of blockCache.keys()) {
      if (key.startsWith(prefix)) blockCache.delete(key);
    }
  }

  s.lastPosition = cloneVec3(player.location);
  s.lastRotation = cloneVec2(player.getRotation());
  s.dimensionId = newDimId;
}

export function hasMoved(player, s) {
  if (player.dimension.id !== s.dimensionId) return true;
  const loc = player.location;
  const rot = player.getRotation();
  const tol = CONFIG.movementTolerance;

  return (
    Math.abs(loc.x - s.lastPosition.x) > tol ||
    Math.abs(loc.y - s.lastPosition.y) > tol ||
    Math.abs(loc.z - s.lastPosition.z) > tol ||
    angleDiff(rot.y, s.lastRotation.y) > CONFIG.rotationTolerance ||
    Math.abs(rot.x - s.lastRotation.x) > CONFIG.rotationTolerance
  );
}

export function buildSequence(baseYaw, seed) {
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
