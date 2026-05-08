import { rotateRel, faceTarget } from "../utils/rotation";
import { pullCamera } from "./collision";

export function getCameraFrame(player, s) {
  const shot = s.sequence[s.sequenceIndex];
  const progress = shot.duration <= 0 ? 0 : s.shotTicks / shot.duration;
  const breath = Math.sin(s.waveClock + progress * Math.PI * 2);
  const drift = Math.cos(s.waveClock * 0.7 + progress * Math.PI * 2);
  const anchor = s.anchor;
  const loc = player.location;

  const desiredOff = rotateRel(
    shot.yaw,
    shot.distance,
    drift * shot.slide,
    shot.height + breath * shot.bob,
  );
  const desired = {
    x: anchor.x + desiredOff.x,
    y: anchor.y + desiredOff.y,
    z: anchor.z + desiredOff.z,
  };

  const targetOff = rotateRel(
    s.baseYaw,
    shot.targetForward,
    shot.targetRight,
    shot.targetUp,
  );
  const target = {
    x: loc.x + targetOff.x,
    y: loc.y + targetOff.y,
    z: loc.z + targetOff.z,
  };

  const position = pullCamera(player.dimension, target, desired, shot.height);
  return { position, rotation: faceTarget(position, target) };
}
