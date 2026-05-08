import { getLocKey, getBlockSafe } from "../utils/block";
import { DIRECTIONS } from "../constants";
import { CFG } from "../config";

export const scanVein = (startBlock, targetId) => {
  const dimension = startBlock.dimension;
  const locations = [];
  const visited = new Set();
  const queue = [startBlock.location];

  let head = 0;

  visited.add(getLocKey(startBlock.location.x, startBlock.location.y, startBlock.location.z));

  while (head < queue.length && locations.length < CFG.maxBlocksPerVein) {
    const currentLoc = queue[head++];
    locations.push(currentLoc);

    for (let i = 0; i < DIRECTIONS.length; i++) {
      const dir = DIRECTIONS[i];
      const nx = currentLoc.x + dir.x;
      const ny = currentLoc.y + dir.y;
      const nz = currentLoc.z + dir.z;

      const key = getLocKey(nx, ny, nz);
      if (visited.has(key)) continue;

      visited.add(key);
      const b = getBlockSafe(dimension, { x: nx, y: ny, z: nz });
      if (b && b.typeId === targetId) {
        queue.push({ x: nx, y: ny, z: nz });
      }
    }
  }
  return { locations, visitedKeys: Array.from(visited) };
};
