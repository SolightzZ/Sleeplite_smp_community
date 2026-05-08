import { CONFIG } from "../config";
import { cinematicScheduler } from "./scheduler";
import { buildSequence } from "./sequence";
import { ensureState } from "./state";
import { refreshBaseline } from "../utils/player";
import { hashStr } from "../utils/math";

export function startAfk(player, s) {
  s.isAfk = true;
  s.idleTicks = s.idleSecondsCache;

  const loc = player.location;
  s.anchor.x = loc.x; s.anchor.y = loc.y; s.anchor.z = loc.z;

  s.baseYaw = player.getRotation().y;
  s.sequence = buildSequence(s.baseYaw, hashStr(player.id));
  s.sequenceIndex = 0;
  s.shotTicks = 0;
  s.waveClock = Math.random() * Math.PI * 2;
  s.warningShown = false;

  try {
    player.runCommand("hud @s hide all");
    player.runCommand(`camera @s fov_set ${CONFIG.cinematicFov}`);
  } catch { }

  cinematicScheduler.enqueue(player.id, player);
}

export function stopAfk(player, s) {
  s.isAfk = false;
  s.idleTicks = 0;
  s.warningShown = false;

  cinematicScheduler.dequeue(player.id);

  try {
    player.runCommand("camera @s clear");
    player.runCommand("camera @s fov_clear 0.2 linear");
    player.runCommand("hud @s reset");
  } catch { }
}

export function startCinematicNow(player) {
  if (!player.isValid) return;
  const s = ensureState(player);
  if (s.isAfk) {
    try { player.sendMessage("§7[AFK] Cinematic is already running."); } catch { }
    return;
  }
  refreshBaseline(player, s);
  startAfk(player, s);
}
