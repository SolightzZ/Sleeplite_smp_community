import { EntityComponentTypes, EquipmentSlot, world } from "@minecraft/server";
import {
    FLASHLIGHT_ID, TRACE_DISTANCE, HEAD_THRESHOLD, DIR_THRESHOLD,
    LIGHT_BLOCK, AIR_BLOCK, Y_MIN, Y_MAX
} from "../config.js";
import { activeLights, movementCache } from "./state.js";

export function getTargetLightPos(head, dir, dim) {
    const x = Math.floor(head.x + dir.x * TRACE_DISTANCE);
    const y = Math.floor(head.y + dir.y * TRACE_DISTANCE);
    const z = Math.floor(head.z + dir.z * TRACE_DISTANCE);
    const range = dim.heightRange;
    const min = range ? range.min : Y_MIN;
    const max = range ? range.max : Y_MAX;
    if (y < min || y > max) return null;
    return { x, y, z };
}

export function clearLight(playerId, fallbackDim) {
    const light = activeLights.get(playerId);
    if (!light) {
        movementCache.delete(playerId);
        return;
    }
    const dim = world.getDimension(light.dimId) || fallbackDim;
    if (dim) {
        try {
            const block = dim.getBlock(light);
            if (block && (block.typeId === LIGHT_BLOCK || block.typeId === "minecraft:light_block")) {
                block.setType(AIR_BLOCK);
            }
        } catch (e) { }
    }
    activeLights.delete(playerId);
    movementCache.delete(playerId);
}

export function updatePlayer(player) {
    if (!player || !player.isValid) return;
    const id = player.id;
    const equippable = player.getComponent(EntityComponentTypes.Equippable);
    if (!equippable) return;
    const main = equippable.getEquipment(EquipmentSlot.Mainhand);
    const off = equippable.getEquipment(EquipmentSlot.Offhand);
    const isHolding = (main && main.typeId === FLASHLIGHT_ID) || (off && off.typeId === FLASHLIGHT_ID);
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
        const dx = Math.abs(cache.x - head.x);
        const dy = Math.abs(cache.y - head.y);
        const dz = Math.abs(cache.z - head.z);
        const ddx = Math.abs(cache.dx - dir.x);
        const ddy = Math.abs(cache.dy - dir.y);
        const ddz = Math.abs(cache.dz - dir.z);
        if (dx < HEAD_THRESHOLD && dy < HEAD_THRESHOLD && dz < HEAD_THRESHOLD &&
            ddx < DIR_THRESHOLD && ddy < DIR_THRESHOLD && ddz < DIR_THRESHOLD) {
            return;
        }
        cache.x = head.x; cache.y = head.y; cache.z = head.z;
        cache.dx = dir.x; cache.dy = dir.y; cache.dz = dir.z;
    } else {
        movementCache.set(id, { x: head.x, y: head.y, z: head.z, dx: dir.x, dy: dir.y, dz: dir.z });
    }
    const currentDim = player.dimension;
    const nextPos = getTargetLightPos(head, dir, currentDim);
    const prevLight = activeLights.get(id);
    if (prevLight && nextPos &&
        prevLight.x === nextPos.x &&
        prevLight.y === nextPos.y &&
        prevLight.z === nextPos.z &&
        prevLight.dimId === currentDim.id
    ) {
        return;
    }
    if (prevLight) {
        try {
            const pDim = world.getDimension(prevLight.dimId);
            if (pDim) {
                const oldBlock = pDim.getBlock(prevLight);
                if (oldBlock && (oldBlock.typeId === LIGHT_BLOCK || oldBlock.typeId === "minecraft:light_block")) {
                    oldBlock.setType(AIR_BLOCK);
                }
            }
        } catch (e) { }
    }
    if (nextPos) {
        try {
            const newBlock = currentDim.getBlock(nextPos);
            if (newBlock) {
                const type = newBlock.typeId;
                if (type === AIR_BLOCK || type === LIGHT_BLOCK || type === "minecraft:light_block") {
                    newBlock.setType(LIGHT_BLOCK);
                    if (prevLight) {
                        prevLight.x = nextPos.x; prevLight.y = nextPos.y; prevLight.z = nextPos.z; prevLight.dimId = currentDim.id;
                    } else {
                        activeLights.set(id, { x: nextPos.x, y: nextPos.y, z: nextPos.z, dimId: currentDim.id });
                    }
                    return;
                }
            }
        } catch (e) { }
    }
    activeLights.delete(id);
}
