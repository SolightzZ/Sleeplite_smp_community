import { world } from "@minecraft/server";
import {
  RECONCILE_INTERVAL,
  TARGET_LATENCY_TICKS,
  BATCH_MIN,
  BATCH_MAX,
} from "../config.js";
import { playersQueue, queueState } from "./queue.js";
import { activeLights } from "./state.js";
import { updatePlayer, clearLight } from "./light-manager.js";

export function reconcilePlayers() {
  const players = world.getAllPlayers();
  const playersLen = players.length;
  const liveIds = new Set();
  for (let i = 0; i < playersLen; i++) {
    liveIds.add(players[i].id);
  }
  const activeIds = Array.from(activeLights.keys());
  const activeLen = activeIds.length;
  for (let i = 0; i < activeLen; i++) {
    const id = activeIds[i];
    if (!liveIds.has(id)) {
      clearLight(id);
    }
  }
  playersQueue.length = 0;
  for (let i = 0; i < playersLen; i++) {
    const p = players[i];
    if (p && p.isValid) {
      playersQueue.push(p);
    }
  }
  if (queueState.index >= playersQueue.length) {
    queueState.index = 0;
  }
}

export function FlashlightRunInterval() {
  queueState.tick++;
  if (queueState.tick % RECONCILE_INTERVAL === 0) {
    reconcilePlayers();
  }
  if (playersQueue.length === 0) return;
  const activeCount = activeLights.size || 1;
  const batchSize = Math.min(
    BATCH_MAX,
    Math.max(BATCH_MIN, Math.ceil(activeCount / TARGET_LATENCY_TICKS)),
  );
  for (let i = 0; i < batchSize; i++) {
    if (playersQueue.length === 0) break;
    if (queueState.index >= playersQueue.length) {
      queueState.index = 0;
    }
    const player = playersQueue[queueState.index];
    if (player && player.isValid) {
      updatePlayer(player);
      queueState.index++;
    } else {
      const last = playersQueue.pop();
      if (queueState.index < playersQueue.length) {
        playersQueue[queueState.index] = last;
      } else {
        queueState.index = 0;
      }
    }
  }
}

export function flashSpawn(event) {
  const player = event.player;
  if (!player || !player.isValid) return;
  const playerId = player.id;
  const qLen = playersQueue.length;
  let isExist = false;
  for (let i = 0; i < qLen; i++) {
    if (playersQueue[i].id === playerId) {
      isExist = true;
      break;
    }
  }
  if (!isExist) {
    playersQueue.push(player);
  }
}

export function flashLeave(playerId) {
  clearLight(playerId);
  const qLen = playersQueue.length;
  for (let i = 0; i < qLen; i++) {
    if (playersQueue[i].id === playerId) {
      const last = playersQueue.pop();
      if (i < playersQueue.length) {
        playersQueue[i] = last;
      }
      if (queueState.index > i) {
        queueState.index--;
      }
      break;
    }
  }
  if (queueState.index >= playersQueue.length) {
    queueState.index = 0;
  }
}

export function handlerFlashlight({ playerId, dimension }) {
  clearLight(playerId, dimension);
}
