import { getBlockSafe } from "../utils/block";
import { LEAF_OFFSETS } from "../constants";
import { CFG } from "../config";

export const detectTree = (startBlock, logTypeId, leafTypeId) => {
  const dimension = startBlock.dimension;
  const locations = [];
  const visited = new Set();
  const queue = [startBlock.location];

  let head = 0;
  let foundLeaf = false;

  const getKey = (x, y, z) => `${x},${y},${z}`;
  visited.add(getKey(startBlock.location.x, startBlock.location.y, startBlock.location.z));

  while (head < queue.length && locations.length < CFG.maxBlocksPerTree) {
    const currentLoc = queue[head++];
    const { x: cx, y: cy, z: cz } = currentLoc;
    const block = getBlockSafe(dimension, currentLoc);

    if (!block || block.typeId !== logTypeId) continue;

    locations.push(currentLoc);

    if (!foundLeaf) {
      for (let i = 0; i < LEAF_OFFSETS.length; i++) {
        const off = LEAF_OFFSETS[i];
        if (getBlockSafe(dimension, { x: cx + off.x, y: cy + off.y, z: cz + off.z })?.typeId === leafTypeId) {
          foundLeaf = true;
          break;
        }
      }
    }

    const nextLocs = [
      { x: cx, y: cy + 1, z: cz },
      { x: cx, y: cy - 1, z: cz },
    ];

    for (let i = 0; i < nextLocs.length; i++) {
      const loc = nextLocs[i];
      const key = getKey(loc.x, loc.y, loc.z);
      if (!visited.has(key)) {
        visited.add(key);
        queue.push(loc);
      }
    }
  }

  return { locations, foundLeaf };
};
