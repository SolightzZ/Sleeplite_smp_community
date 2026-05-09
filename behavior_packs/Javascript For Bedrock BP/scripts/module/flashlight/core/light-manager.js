import { EntityComponentTypes, EquipmentSlot, world } from "@minecraft/server";
import { FLASHLIGHT_ITEM, RAYCAST_DISTANCE, THRESHOLD_HEAD_MOVE, THRESHOLD_VIEW_DIR, BLOCK_LIGHT, BLOCK_AIR, WORLD_Y_MIN, WORLD_Y_MAX } from "../config.js";
import { playerLights, playerLastPos } from "./state.js";

export function calcLightPos(headPos, viewDir, dimension) {
  const x = Math.floor(headPos.x + viewDir.x * RAYCAST_DISTANCE);
  const y = Math.floor(headPos.y + viewDir.y * RAYCAST_DISTANCE);
  const z = Math.floor(headPos.z + viewDir.z * RAYCAST_DISTANCE);
  const range = dimension.heightRange;
  const min = range ? range.min : WORLD_Y_MIN;
  const max = range ? range.max : WORLD_Y_MAX;
  if (y < min || y > max) return null;
  return { x, y, z };
}

export function isFlashlightHeld(player) {
  const equippable = player.getComponent(EntityComponentTypes.Equippable);
  if (!equippable) return false;
  const main = equippable.getEquipment(EquipmentSlot.Mainhand);
  const off = equippable.getEquipment(EquipmentSlot.Offhand);
  return (main && main.typeId === FLASHLIGHT_ITEM) || (off && off.typeId === FLASHLIGHT_ITEM);
}

export function hasPlayerMoved(playerId, headPos, viewDir) {
  const last = playerLastPos.get(playerId);
  if (!last) {
    playerLastPos.set(playerId, { x: headPos.x, y: headPos.y, z: headPos.z, dx: viewDir.x, dy: viewDir.y, dz: viewDir.z });
    return true;
  }
  const dx = Math.abs(last.x - headPos.x);
  const dy = Math.abs(last.y - headPos.y);
  const dz = Math.abs(last.z - headPos.z);
  const ddx = Math.abs(last.dx - viewDir.x);
  const ddy = Math.abs(last.dy - viewDir.y);
  const ddz = Math.abs(last.dz - viewDir.z);
  if (dx < THRESHOLD_HEAD_MOVE && dy < THRESHOLD_HEAD_MOVE && dz < THRESHOLD_HEAD_MOVE && ddx < THRESHOLD_VIEW_DIR && ddy < THRESHOLD_VIEW_DIR && ddz < THRESHOLD_VIEW_DIR) {
    return false;
  }
  last.x = headPos.x;
  last.y = headPos.y;
  last.z = headPos.z;
  last.dx = viewDir.x;
  last.dy = viewDir.y;
  last.dz = viewDir.z;
  return true;
}

export function removeLightBlock(playerId, fallbackDim) {
  const light = playerLights.get(playerId);
  if (!light) {
    playerLastPos.delete(playerId);
    return;
  }
  playerLights.delete(playerId);
  playerLastPos.delete(playerId);
  const dim = world.getDimension(light.dimId) || fallbackDim;
  if (!dim) return;
  try {
    const block = dim.getBlock(light);
    if (block && (block.typeId === BLOCK_LIGHT || block.typeId === "minecraft:light_block")) {
      block.setType(BLOCK_AIR);
    }
  } catch (e) {}
}

export function placeLightForPlayer(player) {
  if (!player || !player.isValid) return;
  const playerId = player.id;
  if (!isFlashlightHeld(player)) {
    if (playerLights.has(playerId)) {
      removeLightBlock(playerId, player.dimension);
    }
    return;
  }
  const headPos = player.getHeadLocation();
  const viewDir = player.getViewDirection();
  if (!hasPlayerMoved(playerId, headPos, viewDir)) return;
  const currentDim = player.dimension;
  const newPos = calcLightPos(headPos, viewDir, currentDim);
  const oldLight = playerLights.get(playerId);
  if (oldLight && newPos && oldLight.x === newPos.x && oldLight.y === newPos.y && oldLight.z === newPos.z && oldLight.dimId === currentDim.id) {
    return;
  }
  if (oldLight) {
    try {
      const oldDim = world.getDimension(oldLight.dimId);
      if (oldDim) {
        const oldBlock = oldDim.getBlock(oldLight);
        if (oldBlock && (oldBlock.typeId === BLOCK_LIGHT || oldBlock.typeId === "minecraft:light_block")) {
          oldBlock.setType(BLOCK_AIR);
        }
      }
    } catch (e) {}
  }
  if (!newPos) {
    playerLights.delete(playerId);
    return;
  }
  try {
    const targetBlock = currentDim.getBlock(newPos);
    if (!targetBlock) {
      playerLights.delete(playerId);
      return;
    }
    const typeId = targetBlock.typeId;
    const isReplaceable = typeId === BLOCK_AIR || typeId === BLOCK_LIGHT || typeId === "minecraft:light_block";
    if (!isReplaceable) {
      playerLights.delete(playerId);
      return;
    }
    targetBlock.setType(BLOCK_LIGHT);
    if (oldLight) {
      oldLight.x = newPos.x;
      oldLight.y = newPos.y;
      oldLight.z = newPos.z;
      oldLight.dimId = currentDim.id;
    } else {
      playerLights.set(playerId, { x: newPos.x, y: newPos.y, z: newPos.z, dimId: currentDim.id });
    }
  } catch (e) {
    playerLights.delete(playerId);
  }
}
