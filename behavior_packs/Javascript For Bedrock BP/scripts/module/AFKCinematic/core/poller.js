import { world } from "@minecraft/server";
import { CONFIG } from "../config.js";
import { playerStates } from "./state.js";
import { cloneVec3 } from "../utils/math.js";
import { ensureState, refreshBaseline, hasMoved } from "./stateManager.js";
import { startAfk, stopAfk } from "./afk.js";
import { CinematicScheduler } from "./scheduler.js";

export const cinematicScheduler = new CinematicScheduler();

export function handleIdlePoller() {
  try {
    const players = world.getAllPlayers();

    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      if (!player.isValid) continue;

      const s = ensureState(player);

      if (s.isAfk) {
        if (hasMoved(player, s)) {
          stopAfk(player, s, cinematicScheduler);
          refreshBaseline(player, s);
          s.anchor = cloneVec3(player.location);
        }
        continue;
      }

      if (hasMoved(player, s)) {
        refreshBaseline(player, s);
        s.idleTicks = 0;
        s.warningShown = false;
        s.anchor = cloneVec3(player.location);
        continue;
      }

      s.idleTicks++;

      const idleTicksTarget = s.idleSecondsCache * 20;
      const warningTicksTarget = s.warningSecondsCache * 20;
      const remaining = idleTicksTarget - s.idleTicks;
      const remainingSeconds = Math.ceil(remaining / 20);

      if (!s.warningShown && remaining <= warningTicksTarget) {
        s.warningShown = true;
      }
      if (s.warningShown && remaining > 0) {
        player.onScreenDisplay.setActionBar(`§eAFK Cinematic in §c${remainingSeconds}s`);
      }

      if (remaining <= 0) {
        startAfk(player, s, cinematicScheduler);
      }
    }
  } catch (error) {
    console.error("[ AFKCinematic ] handleIdlePoller: " + error);
  }
}

export function playerLeaveAfk(playerId) {
  try {
    if (!playerId) return;
    cinematicScheduler.dequeue(playerId);
    playerStates.delete(playerId);
  } catch (error) {
    console.error("[ AFKCinematic ] playerLeaveAfk: " + error);
  }
}

export function setPlayerIdleTime(player, seconds) {
  try {
    const s = ensureState(player);
    const clamped = Math.max(CONFIG.minIdleSeconds, Math.min(CONFIG.maxIdleSeconds, Math.floor(seconds)));
    s.idleSeconds = clamped;
    s.idleTicks = 0;
    s.idleSecondsCache = clamped;
    s.warningSecondsCache = Math.min(CONFIG.warningSeconds, Math.max(1, clamped - 1));
    s.warningShown = false;
    refreshBaseline(player, s);
    player.sendMessage(`§7[AFK] Start time set to §e${clamped}§7 seconds.`);
  } catch (error) {
    console.error("[ AFKCinematic ] setPlayerIdleTime: " + error);
  }
}

export function startCinematicNow(player) {
  try {
    if (!player.isValid) return;
    const s = ensureState(player);
    if (s.isAfk) {
      player.sendMessage("§7[AFK] Cinematic is already running.");
      return;
    }
    refreshBaseline(player, s);
    startAfk(player, s, cinematicScheduler);
  } catch (error) {
    console.error(" [ AFKCinematic ] startCinematicNow: " + error);
  }
}
