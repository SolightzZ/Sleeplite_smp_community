import { world } from "@minecraft/server";
import { RECONCILE_INTERVAL, MAX_PLAYERS_PER_TICK } from "../config.js";
import { playersQueue, queueState } from "./queue.js";
import { activeLights } from "./state.js";
import { updatePlayer, clearLight } from "./light-manager.js";

export function reconcilePlayers() {
  const players = world.getPlayers();

  const liveIds = new Set();
  for (let i = 0; i < players.length; i++) {
    liveIds.add(players[i].id);
  }

  for (const id of activeLights.keys()) {
    if (!liveIds.has(id)) {
      clearLight(id, world.getDimension("minecraft:overworld"));
    }
  }

  playersQueue.length = 0;
  for (let i = 0; i < players.length; i++) {
    if (players[i] && players[i].isValid) {
      playersQueue.push(players[i]);
    }
  }

  if (queueState.index >= playersQueue.length) queueState.index = 0;
}

export function FlashlightRunInterval() {
  queueState.tick++;

  if (queueState.tick % RECONCILE_INTERVAL === 0) {
    reconcilePlayers();
  }

  const qLen = playersQueue.length;
  if (qLen === 0) return;

  const processCount = Math.min(qLen, MAX_PLAYERS_PER_TICK);

  for (let i = 0; i < processCount; i++) {
    if (queueState.index >= playersQueue.length) queueState.index = 0;

    const player = playersQueue[queueState.index];
    if (player && player.isValid) {
      updatePlayer(player);
      queueState.index++;
    } else {
      const last = playersQueue.pop();
      if (queueState.index < playersQueue.length) {
        playersQueue[queueState.index] = last;
      }
    }
  }
}

export function flashSpawn(event) {
  const player = event.player;
  if (!player || !player.isValid) return;

  let isExist = false;
  for (let i = 0; i < playersQueue.length; i++) {
    if (playersQueue[i].id === player.id) {
      isExist = true;
      break;
    }
  }

  if (!isExist) {
    playersQueue.push(player);
  }
}

export function flashLeave(playerId) {
  clearLight(playerId, world.getDimension("minecraft:overworld"));

  for (let i = 0; i < playersQueue.length; i++) {
    if (playersQueue[i].id === playerId) {
      const last = playersQueue.pop();
      if (i < playersQueue.length) {
        playersQueue[i] = last;
      }
      if (queueState.index > i) queueState.index--;
      break;
    }
  }

  if (queueState.index >= playersQueue.length) queueState.index = 0;
}

export function handlerFlashlight({ playerId, dimension }) {
  const dim = dimension ?? world.getDimension("minecraft:overworld");
  clearLight(playerId, dim);
}
