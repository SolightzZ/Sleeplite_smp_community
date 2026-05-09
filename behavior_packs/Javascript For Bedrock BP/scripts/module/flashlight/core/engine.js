import { world } from "@minecraft/server";
import { TICK_RECONCILE, TICK_TARGET_LATENCY, BATCH_MIN_SIZE, BATCH_MAX_SIZE } from "../config.js";
import { processQueue, queueCursor } from "./queue.js";
import { playerLights } from "./state.js";
import { placeLightForPlayer, removeLightBlock } from "./light-manager.js";

export function syncPlayerQueue() {
  const allPlayers = world.getAllPlayers();
  const allCount = allPlayers.length;
  const liveIds = new Set();
  for (let i = 0; i < allCount; i++) {
    liveIds.add(allPlayers[i].id);
  }
  const trackedIds = Array.from(playerLights.keys());
  const trackedCount = trackedIds.length;
  for (let i = 0; i < trackedCount; i++) {
    const id = trackedIds[i];
    if (!liveIds.has(id)) {
      removeLightBlock(id);
    }
  }
  processQueue.length = 0;
  for (let i = 0; i < allCount; i++) {
    const p = allPlayers[i];
    if (p && p.isValid) {
      processQueue.push(p);
    }
  }
  if (queueCursor.idx >= processQueue.length) {
    queueCursor.idx = 0;
  }
}

export function FlashlightRunInterval() {
  queueCursor.tick++;
  if (queueCursor.tick % TICK_RECONCILE === 0) {
    syncPlayerQueue();
  }
  if (processQueue.length === 0) return;
  const activeCount = playerLights.size || 1;
  const batchSize = Math.min(BATCH_MAX_SIZE, Math.max(BATCH_MIN_SIZE, Math.ceil(activeCount / TICK_TARGET_LATENCY)));
  for (let i = 0; i < batchSize; i++) {
    if (processQueue.length === 0) break;
    if (queueCursor.idx >= processQueue.length) {
      queueCursor.idx = 0;
    }
    const player = processQueue[queueCursor.idx];
    if (player && player.isValid) {
      placeLightForPlayer(player);
      queueCursor.idx++;
    } else {
      const last = processQueue.pop();
      if (queueCursor.idx < processQueue.length) {
        processQueue[queueCursor.idx] = last;
      } else {
        queueCursor.idx = 0;
      }
    }
  }
}

export function flashSpawn(event) {
  const player = event.player;
  if (!player || !player.isValid) return;
  const playerId = player.id;
  const qLen = processQueue.length;
  for (let i = 0; i < qLen; i++) {
    if (processQueue[i].id === playerId) return;
  }
  processQueue.push(player);
}

export function flashLeave(playerId) {
  removeLightBlock(playerId);
  const qLen = processQueue.length;
  for (let i = 0; i < qLen; i++) {
    if (processQueue[i].id === playerId) {
      const last = processQueue.pop();
      if (i < processQueue.length) {
        processQueue[i] = last;
      }
      if (queueCursor.idx > i) {
        queueCursor.idx--;
      }
      break;
    }
  }
  if (queueCursor.idx >= processQueue.length) {
    queueCursor.idx = 0;
  }
}

export function handlerFlashlight(data) {
  removeLightBlock(data.playerId, data.dimension);
}
