import { CONFIG } from "../config.js";
import {
  cloneVec3,
  rotateRelInto,
  faceTargetInto,
  hashStr,
} from "../utils/math.js";
import { pullCamera } from "./block.js";
import { buildSequence } from "./stateManager.js";
import { framePool } from "./state.js";

const safeRun = (player, command) => {
  if (!player || !player.isValid) return;

  try {
    player.runCommand(command);
  } catch (e) {
    console.warn(`[ AFKCinematic ] command failed: ${command} - ${e.message}`);
  }
};

export function startAfk(player, s, cinematicScheduler) {
  s.isAfk = true;
  s.idleTicks = s.idleSecondsCache;
  s.anchor = cloneVec3(player.location);
  s.baseYaw = player.getRotation().y;
  s.sequence = buildSequence(s.baseYaw, hashStr(player.id));
  s.sequenceIndex = 0;
  s.shotTicks = 0;
  s.waveClock = Math.random() * Math.PI * 2;
  s.warningShown = false;

  safeRun(player, "hud @s hide all");
  safeRun(player, `camera @s fov_set ${CONFIG.cinematicFov}`);

  cinematicScheduler.enqueue(player.id);
}

export function stopAfk(player, s, cinematicScheduler) {
  s.isAfk = false;
  s.idleTicks = 0;
  s.warningShown = false;

  cinematicScheduler.dequeue(player.id);

  safeRun(player, "camera @s clear");
  safeRun(player, "camera @s fov_clear 0.2 linear");
  safeRun(player, "hud @s reset");
}

export function getCameraFrame(player, s) {
  const shot = s.sequence[s.sequenceIndex];
  const progress = shot.duration <= 0 ? 0 : s.shotTicks / shot.duration;
  const breath = Math.sin(s.waveClock + progress * Math.PI * 2);
  const drift = Math.cos(s.waveClock * 0.7 + progress * Math.PI * 2);

  const desiredOff = framePool.desiredOff;
  rotateRelInto(
    desiredOff,
    shot.yaw,
    shot.distance,
    drift * shot.slide,
    shot.height + breath * shot.bob,
  );

  const desired = framePool.desired;
  desired.x = s.anchor.x + desiredOff.x;
  desired.y = s.anchor.y + desiredOff.y;
  desired.z = s.anchor.z + desiredOff.z;

  const targetOff = framePool.targetOff;
  rotateRelInto(
    targetOff,
    s.baseYaw,
    shot.targetForward,
    shot.targetRight,
    shot.targetUp,
  );

  const loc = player.location;
  const target = framePool.target;
  target.x = loc.x + targetOff.x;
  target.y = loc.y + targetOff.y;
  target.z = loc.z + targetOff.z;

  const position = pullCamera(player.dimension, target, desired, shot.height);
  const rotation = faceTargetInto(framePool.rotation, position, target);

  return { position, rotation };
}
