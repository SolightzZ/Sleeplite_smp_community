import { CONFIG } from "../config";

export const playerStates = new Map();
export const blockCache = new Map();

export function ensureState(player) {
  let s = playerStates.get(player.id);
  if (s) return s;

  const loc = player.location;
  const rot = player.getRotation();

  s = {
    player,
    lastPosition: { x: loc.x, y: loc.y, z: loc.z },
    lastRotation: { x: rot.x, y: rot.y },
    dimensionId: player.dimension.id,
    idleTicks: 0,
    idleSeconds: CONFIG.defaultIdleSeconds,
    idleSecondsCache: CONFIG.defaultIdleSeconds,
    warningSecondsCache: CONFIG.warningSeconds,
    warningShown: false,
    isAfk: false,
    anchor: { x: loc.x, y: loc.y, z: loc.z },
    baseYaw: rot.y,
    sequence: [],
    sequenceIndex: 0,
    shotTicks: 0,
    waveClock: Math.random() * Math.PI * 2,
  };
  playerStates.set(player.id, s);
  return s;
}
