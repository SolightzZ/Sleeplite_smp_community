import { EquipmentSlot, system, world } from "@minecraft/server";

const previousLights = new Map();
const playerCache = new Map();

let index = 0;

system.runInterval(() => {
  const players = world.getAllPlayers();
  if (!players.length) return;

  for (let i = 0; i < 2; i++) {
    if (index >= players.length) index = 0;
    const player = players[index++];
    updatePlayer(player);
  }
}, 2);

function updatePlayer(player) {
  const id = player.id;

  const equippable = player.getComponent("equippable");
  if (!equippable) return;

  const isHolding = isHoldingFlashlight(equippable);

  // skip heavy logic ถ้าไม่มี flashlight และไม่มี light ค้าง
  if (!isHolding && !previousLights.has(id)) return;

  const prev = previousLights.get(id) ?? [];
  const dim = player.dimension;

  if (!isHolding) {
    clearLights(dim, prev);
    previousLights.delete(id);
    playerCache.delete(id);
    return;
  }

  const head = player.getHeadLocation();
  const dir = player.getViewDirection();

  if (!hasMoved(id, head, dir)) return;

  const next = traceLightPositions(head, dir, dim);
  applyLightDiff(dim, prev, next);

  previousLights.set(id, next);
}

// arrow (pure)
const isHoldingFlashlight = (equippable) => {
  const held = equippable.getEquipment(EquipmentSlot.Mainhand);
  const off = equippable.getEquipment(EquipmentSlot.Offhand);
  return held?.typeId === "gao:flashlight" || off?.typeId === "gao:flashlight";
};

// arrow (light logic + cache)
const hasMoved = (id, head, dir) => {
  const cache = playerCache.get(id);

  if (
    cache &&
    Math.abs(cache.x - head.x) < 0.2 &&
    Math.abs(cache.y - head.y) < 0.2 &&
    Math.abs(cache.z - head.z) < 0.2 &&
    Math.abs(cache.dx - dir.x) < 0.05 &&
    Math.abs(cache.dy - dir.y) < 0.05 &&
    Math.abs(cache.dz - dir.z) < 0.05
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
};

// function (loop + getBlock heavy)
function traceLightPositions(head, dir, dim) {
  const result = [];

  let lx, ly, lz;

  for (let i = 3; i <= 16; i += 3) {
    const x = Math.floor(head.x + dir.x * i);
    const y = Math.floor(head.y + dir.y * i);
    const z = Math.floor(head.z + dir.z * i);

    if (y < -64 || y > 320) continue;

    if (x === lx && y === ly && z === lz) continue;
    lx = x;
    ly = y;
    lz = z;

    const block = dim.getBlock({ x, y, z });
    if (!block) break;

    // stop ray เมื่อชนบล็อกตัน
    if (
      block.typeId !== "minecraft:air" &&
      block.typeId !== "minecraft:light_block_9"
    ) {
      break;
    }

    result.push(x, y, z);
  }

  return result;
}

// function (heavy diff logic)
function applyLightDiff(dim, prev, next) {
  // ADD
  for (let i = 0; i < next.length; i += 3) {
    const x = next[i];
    const y = next[i + 1];
    const z = next[i + 2];

    let found = false;

    for (let j = 0; j < prev.length; j += 3) {
      if (prev[j] === x && prev[j + 1] === y && prev[j + 2] === z) {
        found = true;
        break;
      }
    }

    if (!found) {
      const block = dim.getBlock({ x, y, z });

      if (
        block &&
        (block.typeId === "minecraft:air" ||
          block.typeId === "minecraft:light_block_9")
      ) {
        if (block.typeId !== "minecraft:light_block_9") {
          block.setType("minecraft:light_block_9");
        }
      }
    }
  }

  // REMOVE
  for (let i = 0; i < prev.length; i += 3) {
    const x = prev[i];
    const y = prev[i + 1];
    const z = prev[i + 2];

    let still = false;

    for (let j = 0; j < next.length; j += 3) {
      if (next[j] === x && next[j + 1] === y && next[j + 2] === z) {
        still = true;
        break;
      }
    }

    if (!still) {
      const block = dim.getBlock({ x, y, z });

      if (block?.typeId === "minecraft:light_block_9") {
        block.setType("minecraft:air");
      }
    }
  }
}

// function (IO heavy)
function clearLights(dim, prev) {
  for (let i = 0; i < prev.length; i += 3) {
    const block = dim.getBlock({
      x: prev[i],
      y: prev[i + 1],
      z: prev[i + 2],
    });

    if (block?.typeId === "minecraft:light_block_9") {
      block.setType("minecraft:air");
    }
  }
}

const handlerFlashlight = ({ playerId }) => {
  try {
    const prev = previousLights.get(playerId);
    if (!prev) return;
    const dim = world.getDimension("overworld");
    clearLights(dim, prev);
    previousLights.delete(playerId);
    playerCache.delete(playerId);
  } catch (erro) {
    console.log("Flashlight: " + erro);
  }
};

export { handlerFlashlight };
