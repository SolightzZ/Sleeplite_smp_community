import { world } from "@minecraft/server";
import { blockCache, ensureState, playerStates } from "./state";
import { hasMoved, refreshBaseline } from "../utils/player";
import { startAfk, stopAfk } from "./afk-manager";
import { cinematicScheduler } from "./scheduler";
import { CONFIG } from "../config";

export function handleIdlePoller() {
  blockCache.clear();
  const players = world.getAllPlayers();

  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    if (!player.isValid) continue;

    const s = ensureState(player);

    if (s.isAfk) {
      if (hasMoved(player, s)) {
        stopAfk(player, s);
        refreshBaseline(player, s);
        const loc = player.location;
        s.anchor.x = loc.x; s.anchor.y = loc.y; s.anchor.z = loc.z;
      }
      continue;
    }

    if (hasMoved(player, s)) {
      refreshBaseline(player, s);
      s.idleTicks = 0;
      s.warningShown = false;
      try { player.onScreenDisplay.setActionBar(""); } catch { }
      const loc = player.location;
      s.anchor.x = loc.x; s.anchor.y = loc.y; s.anchor.z = loc.z;
      continue;
    }

    s.idleTicks++;

    const totalSecs = s.idleSecondsCache;
    const warnSecs = s.warningSecondsCache;
    const remaining = totalSecs - s.idleTicks;

    if (!s.warningShown && remaining <= warnSecs) {
      s.warningShown = true;
    }
    if (s.warningShown && remaining > 0) {
      try {
        player.onScreenDisplay.setActionBar(`§eAFK Cinematic in §c${remaining}s`);
      } catch { }
    }

    if (s.idleTicks >= totalSecs) {
      startAfk(player, s);
    }
  }
}

export function playerLeaveAfk(playerId) {
  if (!playerId) return;
  cinematicScheduler.dequeue(playerId);
  playerStates.delete(playerId);
}

export function setPlayerIdleTime(player, seconds) {
  if (!player.isValid) return;
  const s = ensureState(player);
  const clamped = Math.max(
    CONFIG.minIdleSeconds,
    Math.min(CONFIG.maxIdleSeconds, Math.floor(seconds)),
  );
  s.idleSeconds = clamped;
  s.idleTicks = 0;
  s.idleSecondsCache = clamped;
  s.warningSecondsCache = Math.min(CONFIG.warningSeconds, Math.max(1, clamped - 1));
  s.warningShown = false;

  refreshBaseline(player, s);

  try {
    player.sendMessage(`§7[AFK] Start time set to §e${clamped}§7 seconds.`);
  } catch { }
}
