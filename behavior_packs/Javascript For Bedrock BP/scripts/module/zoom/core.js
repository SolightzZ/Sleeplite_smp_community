import { world } from "@minecraft/server";
import { applyZoom, clearZoom, playZoomSound } from "./Effect.js";
import { getPlayerConfig } from "./Storage.js";

const activeZoomPlayers = new Set();

export function toggleZoom(player) {
  if (activeZoomPlayers.has(player.id)) {
    disableZoom(player);
    return;
  }
  enableZoom(player);
}

export function enableZoom(player) {
  if (!player.isValid) return;

  activeZoomPlayers.add(player.id);

  const config = getPlayerConfig(player);

  applyZoom(player, config);

  if (config.playSound) {
    playZoomSound(player);
  }
}

export function disableZoom(player) {
  if (!player.isValid) return;
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
