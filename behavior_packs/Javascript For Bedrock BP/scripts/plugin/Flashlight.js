import {
  EntityComponentTypes,
  EquipmentSlot,
  system,
  world,
} from "@minecraft/server";

const LIGHT_BLOCK = "minecraft:light_block_15";
const AIR_BLOCK = "minecraft:air";
const FLASHLIGHT_ID = "gao:flashlight";

const RECONCILE_INTERVAL = 200;
const TARGET_LATENCY_TICKS = 5;

const BATCH_MIN = 1;
const BATCH_MAX = 8;

const HEAD_THRESHOLD = 0.15;
const DIR_THRESHOLD = 0.04;

const Y_MIN = -64;
const Y_MAX = 320;

const previousLights = new Map();
const playerCache = new Map();

let playersCache = [];
let index = 0;
let tick = 0;

function FlashlightRunInterval() {
  try {
    tick++;

    if (tick % RECONCILE_INTERVAL === 0) {
      reconcilePlayers();
    }

    if (playersCache.length === 0) return;

    const activeCount = previousLights.size || 1;
    const batchSize = Math.min(
      BATCH_MAX,
      Math.max(BATCH_MIN, Math.ceil(activeCount / TARGET_LATENCY_TICKS)),
    );

    for (let i = 0; i < batchSize; i++) {
      if (index >= playersCache.length) index = 0;

      const player = playersCache[index++];
      if (player?.isValid) {
        updatePlayer(player);
      }
    }
  } catch (err) {
    console.error("[Flashlight] FlashlightRunInterval:", err);
  }
}

function updatePlayer(player) {
  try {
    const id = player.id;

    const equippable = player.getComponent(EntityComponentTypes.Equippable);
    if (!equippable) return;

    const isHolding = isHoldingFlashlight(equippable);

    if (!isHolding) {
      if (previousLights.has(id)) {
        clearPlayerLights(player.dimension, id);
      }
      return;
    }

    const head = player.getHeadLocation();
    const dir = player.getViewDirection();

    if (!hasMoved(id, head, dir)) return;

    const dim = player.dimension;
    const prevSet = previousLights.get(id) ?? new Set();
    const nextSet = traceLightPositions(head, dir, dim);

    applyLightDiff(dim, prevSet, nextSet);

    if (nextSet.size > 0) {
      previousLights.set(id, nextSet);
    } else {
      previousLights.delete(id);
    }
  } catch (err) {
    console.error("[Flashlight] updatePlayer:", err);
  }
}

function isHoldingFlashlight(equippable) {
  try {
    const main = equippable.getEquipment(EquipmentSlot.Mainhand);
    const off = equippable.getEquipment(EquipmentSlot.Offhand);
    return main?.typeId === FLASHLIGHT_ID || off?.typeId === FLASHLIGHT_ID;
  } catch (err) {
    console.error("[Flashlight] isHoldingFlashlight:", err);
    return false;
  }
}

function hasMoved(id, head, dir) {
  try {
    const cache = playerCache.get(id);

    if (
      cache &&
      Math.abs(cache.x - head.x) < HEAD_THRESHOLD &&
      Math.abs(cache.y - head.y) < HEAD_THRESHOLD &&
      Math.abs(cache.z - head.z) < HEAD_THRESHOLD &&
      Math.abs(cache.dx - dir.x) < DIR_THRESHOLD &&
      Math.abs(cache.dy - dir.y) < DIR_THRESHOLD &&
      Math.abs(cache.dz - dir.z) < DIR_THRESHOLD
    ) {
      return false;
    }

    playerCache.set(id, {
      x: head.x,
      y: head.y,
      z: head.z,
      dx: dir.x,
      dy: dir.y,
      dz: dir.z,
    });

    return true;
  } catch (err) {
    console.error("[Flashlight] hasMoved:", err);
    return true;
  }
}

function traceLightPositions(head, dir, dim) {
  const result = new Set();

  try {
    const x = Math.floor(head.x + dir.x);
    const y = Math.floor(head.y + dir.y);
    const z = Math.floor(head.z + dir.z);

    if (y < Y_MIN || y > Y_MAX) return result;

    const block = dim.getBlock({ x, y, z });
    if (block && (block.typeId === AIR_BLOCK || block.typeId === LIGHT_BLOCK)) {
      result.add(`${x},${y},${z}`);
    }
  } catch (err) {
    console.error("[Flashlight] traceLightPositions:", err);
  }

  return result;
}

function applyLightDiff(dim, prevSet, nextSet) {
  try {
    for (const key of nextSet) {
      if (prevSet.has(key)) continue;

      const [x, y, z] = parseKey(key);
      const block = dim.getBlock({ x, y, z });

      if (block?.typeId === AIR_BLOCK) {
        block.setType(LIGHT_BLOCK);
      }
    }

    for (const key of prevSet) {
      if (nextSet.has(key)) continue;

      const [x, y, z] = parseKey(key);
      const block = dim.getBlock({ x, y, z });

      if (block?.typeId === LIGHT_BLOCK) {
        block.setType(AIR_BLOCK);
      }
    }
  } catch (err) {
    console.error("[Flashlight] applyLightDiff:", err);
  }
}

function clearPlayerLights(dim, playerId) {
  try {
    const lights = previousLights.get(playerId);
    if (!lights) return;

    for (const key of lights) {
      const [x, y, z] = parseKey(key);
      const block = dim.getBlock({ x, y, z });
      if (block?.typeId === LIGHT_BLOCK) {
        block.setType(AIR_BLOCK);
      }
    }
  } catch (err) {
    console.error("[Flashlight] clearPlayerLights:", err);
  } finally {
    previousLights.delete(playerId);
    playerCache.delete(playerId);
  }
}

function handlerFlashlight({ playerId, dimension }) {
  try {
    if (!previousLights.has(playerId)) return;

    const dim = dimension ?? world.getDimension("overworld");
    clearPlayerLights(dim, playerId);
    console.log("playerId:", playerId);
  } catch (err) {
    console.error("[Flashlight] handlerFlashlight:", err);
  }
}

function parseKey(key) {
  const parts = key.split(",");
  return [+parts[0], +parts[1], +parts[2]];
}

function reconcilePlayers() {
  try {
    const live = new Set(world.getAllPlayers().map((p) => p.id));

    for (const [id] of previousLights) {
      if (!live.has(id)) cleanupPlayer(id);
    }

    playersCache = playersCache.filter((p) => p.isValid && live.has(p.id));

    if (index >= playersCache.length) index = 0;
  } catch (err) {
    console.error("[Flashlight] reconcilePlayers:", err);
  }
}

function cleanupPlayer(playerId) {
  try {
    const lights = previousLights.get(playerId);
    if (lights) {
      const dim = world.getDimension("overworld");
      for (const key of lights) {
        try {
          const [x, y, z] = parseKey(key);
          const block = dim.getBlock({ x, y, z });
          if (block?.typeId === LIGHT_BLOCK) block.setType(AIR_BLOCK);
        } catch {}
      }
    }
  } catch {
  } finally {
    previousLights.delete(playerId);
    playerCache.delete(playerId);
  }
}

// world.afterEvents.playerSpawn.subscribe(({ player, initialSpawn }) => {});
function flashSpawn(event) {
  try {
    const player = event.player;
    if (
      player &&
      player.isValid &&
      !playersCache.some((p) => p.id === player.id)
    ) {
      playersCache.push(player);
      console.log("playersCache:", JSON.stringify(playersCache));
    }
  } catch (error) {
    console.warn("flash_spawn", error.message);
  }
}

// world.afterEvents.playerLeave.subscribe(({ playerId }) => {});
function flashLeave(playerId) {
  try {
    cleanupPlayer(playerId);
    playersCache = playersCache.filter((p) => p.id !== playerId);
    console.log("playerId:", playerId);
    if (index >= playersCache.length) index = 0;
  } catch (error) {
    console.warn("flash_leave", error.message);
  }
}

export { flashLeave, FlashlightRunInterval, flashSpawn, handlerFlashlight };
