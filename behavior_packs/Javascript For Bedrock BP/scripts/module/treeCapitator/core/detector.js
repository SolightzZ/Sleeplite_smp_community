import { getBlockSafe } from '../../../shared/block.js';
import { LEAF_OFFSETS } from '../constants.js';
import { CFG } from '../config.js';

const DIRS = [
   { x: 0, y: 1, z: 0 },
   { x: 0, y: -1, z: 0 },
];

const makeKey = (x, y, z) => `${x},${y},${z}`;

export const detectTree = (startBlock, logId, leafId) => {
   const dim = startBlock.dimension;
   const locations = [];
   const visited = new Set();
   const queue = [startBlock.location];
   const cache = new Map();

   let head = 0;
   let foundLeaf = false;

   const getBlockCached = (loc) => {
      const key = makeKey(loc.x, loc.y, loc.z);
      if (cache.has(key)) return cache.get(key);
      const block = getBlockSafe(dim, loc);
      cache.set(key, block);
      return block;
   };

   const startLoc = startBlock.location;
   visited.add(makeKey(startLoc.x, startLoc.y, startLoc.z));

   while (head < queue.length && locations.length < CFG.maxBlocksPerTree) {
      const curLoc = queue[head++];
      const cx = curLoc.x, cy = curLoc.y, cz = curLoc.z;

      const block = getBlockCached(curLoc);
      if (!block || block.typeId !== logId) continue;

      locations.push(curLoc);

      if (!foundLeaf) {
         for (const offset of LEAF_OFFSETS) {
            const checkLoc = { x: cx + offset.x, y: cy + offset.y, z: cz + offset.z };
            const checkBlock = getBlockCached(checkLoc);
            if (checkBlock && checkBlock.typeId === leafId) {
               foundLeaf = true;
               break;
            }
         }
      }

      for (const d of DIRS) {
         const nx = cx + d.x, ny = cy + d.y, nz = cz + d.z;
         const nKey = makeKey(nx, ny, nz);
         if (!visited.has(nKey)) {
            visited.add(nKey);
            queue.push({ x: nx, y: ny, z: nz });
         }
      }
   }

   return { locations: locations, foundLeaf: foundLeaf };
};
