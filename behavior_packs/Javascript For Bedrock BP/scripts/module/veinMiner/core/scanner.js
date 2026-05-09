import { getLocKey, getBlockSafe } from "../utils/block.js";
import { DIRECTIONS } from "../constants.js";
import { CFG } from "../config.js";

export const scanVein = (startBlock, targetId) => {
  const dim = startBlock.dimension;
  const locations = [];
  const visited = new Set();
  const queue = [startBlock.location];

  let head = 0;

  const startLoc = startBlock.location;
  visited.add(getLocKey(startLoc.x, startLoc.y, startLoc.z));

  while (head < queue.length && locations.length < CFG.maxBlocksPerVein) {
    const curLoc = queue[head++];
    locations.push(curLoc);

    const dirsLen = DIRECTIONS.length;
    for (let i = 0; i < dirsLen; i++) {
      const dir = DIRECTIONS[i];
      const nx = curLoc.x + dir.x;
      const ny = curLoc.y + dir.y;
      const nz = curLoc.z + dir.z;

      const key = getLocKey(nx, ny, nz);
      if (visited.has(key)) continue;

      visited.add(key);
      const b = getBlockSafe(dim, { x: nx, y: ny, z: nz });
      if (b && b.typeId === targetId) {
        queue.push({ x: nx, y: ny, z: nz });
      }
    }
  }

  const visitedKeys = [];
  visited.forEach((key) => visitedKeys.push(key));
  return { locations: locations, visitedKeys: visitedKeys };
};
