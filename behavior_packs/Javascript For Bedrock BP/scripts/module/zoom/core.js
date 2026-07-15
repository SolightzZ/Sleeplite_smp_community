import { world } from "@minecraft/server";
import { applyZoom, clearZoom, playZoomSound } from "./Effect.js";
import { getPlayerConfig } from "./Storage.js";
import { pcheck } from './../../shared/player.js';

const activeZoomPlayers = new Set();

export function toggleZoom(player) {
  if (activeZoomPlayers.has(player.id)) {
    disableZoom(player);
    return;
  }
  enableZoom(player);
}

function enableZoom(player) {
  if (!pcheck(player)) return;

  activeZoomPlayers.add(player.id);

  const config = getPlayerConfig(player);

  applyZoom(player, config);

  if (config.playSound) {
    playZoomSound(player);
  }
}

function disableZoom(player) {
  if (!pcheck(player)) return;
  if (!activeZoomPlayers.has(player.id)) return;

  activeZoomPlayers.delete(player.id);

  const config = getPlayerConfig(player);

  clearZoom(player, config);

  if (config.playSound) {
    playZoomSound(player);
  }
}

export function zoomPlayerLeave(playerId) {
  activeZoomPlayers.delete(playerId);
}

export function zoomEntityDie(event) {
  const entity = event.deadEntity;
  if (entity.typeId !== 'minecraft:player') return;
  disableZoom(entity);
}
