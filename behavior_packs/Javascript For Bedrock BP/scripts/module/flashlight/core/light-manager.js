import { EntityComponentTypes, EquipmentSlot, world } from "@minecraft/server";
import { getAirPerm, getLightPerm } from "../utils/block.js";
import { FLASHLIGHT_ID, TRACE_DISTANCE, HEAD_THRESHOLD, DIR_THRESHOLD } from "../config.js";
import { activeLights, movementCache } from "./state.js";

export function getTargetLightPos(head, dir, dim) {
  const x = Math.floor(head.x + dir.x * TRACE_DISTANCE);
  const y = Math.floor(head.y + dir.y * TRACE_DISTANCE);
  const z = Math.floor(head.z + dir.z * TRACE_DISTANCE);

  const min = dim.heightRange?.min ?? -64;
  const max = dim.heightRange?.max ?? 320;

  if (y < min || y > max) return null;
  return { x, y, z };
}

export function clearLight(playerId, fallbackDim) {
  const light = activeLights.get(playerId);
  if (light) {
    const dim = world.getDimension(light.dimId) ?? fallbackDim;
    if (dim) {
      const block = dim.getBlock(light);
      if (block?.typeId === "minecraft:light_block") {
        block.setPermutation(getAirPerm());
      }
    }
    activeLights.delete(playerId);
  }
  movementCache.delete(playerId);
}

export function updatePlayer(player) {
  const id = player.id;
  const equippable = player.getComponent(EntityComponentTypes.Equippable);
  if (!equippable) return;

  const main = equippable.getEquipment(EquipmentSlot.Mainhand);
  const isHolding = main?.typeId === FLASHLIGHT_ID || equippable.getEquipment(EquipmentSlot.Offhand)?.typeId === FLASHLIGHT_ID;

  if (!isHolding) {
    if (activeLights.has(id)) {
      clearLight(id, player.dimension);
    }
    return;
  }

  const head = player.getHeadLocation();
  const dir = player.getViewDirection();

  const cache = movementCache.get(id);
  if (cache) {
    if (
      Math.abs(cache.x - head.x) < HEAD_THRESHOLD &&
      Math.abs(cache.y - head.y) < HEAD_THRESHOLD &&
      Math.abs(cache.z - head.z) < HEAD_THRESHOLD &&
      Math.abs(cache.dx - dir.x) < DIR_THRESHOLD &&
      Math.abs(cache.dy - dir.y) < DIR_THRESHOLD &&
      Math.abs(cache.dz - dir.z) < DIR_THRESHOLD
    ) {
      return;
    }
    cache.x = head.x; cache.y = head.y; cache.z = head.z;
    cache.dx = dir.x; cache.dy = dir.y; cache.dz = dir.z;
  } else {
    movementCache.set(id, { x: head.x, y: head.y, z: head.z, dx: dir.x, dy: dir.y, dz: dir.z });
  }

  const dim = player.dimension;
  const nextLight = getTargetLightPos(head, dir, dim);
  const prevLight = activeLights.get(id);

  if (
    prevLight && nextLight &&
    prevLight.x === nextLight.x &&
    prevLight.y === nextLight.y &&
    prevLight.z === nextLight.z &&
    prevLight.dimId === dim.id
  ) {
    return;
  }

  if (prevLight) {
    try {
      const pDim = world.getDimension(prevLight.dimId);
      const oldBlock = pDim.getBlock(prevLight);
      if (oldBlock?.typeId === "minecraft:light_block") {
        oldBlock.setPermutation(getAirPerm());
      }
    } catch { }
  }

  if (nextLight) {
    try {
      const newBlock = dim.getBlock(nextLight);
      if (newBlock?.typeId === "minecraft:air" || newBlock?.typeId === "minecraft:light_block") {
        newBlock.setPermutation(getLightPerm());
        if (prevLight) {
          prevLight.x = nextLight.x; prevLight.y = nextLight.y; prevLight.z = nextLight.z; prevLight.dimId = dim.id;
        } else {
          activeLights.set(id, { x: nextLight.x, y: nextLight.y, z: nextLight.z, dimId: dim.id });
        }
      } else {
        activeLights.delete(id);
      }
    } catch {
      activeLights.delete(id);
    }
  } else {
    activeLights.delete(id);
  }
}
