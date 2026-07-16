import { getBlockSafe } from '../../../shared/block.js';
import { LEAF_OFFSETS } from '../constants.js';
import { CFG } from '../config.js';

const HALF = CFG.maxBlocksPerTree + 2;
const STRIDE = HALF * 2;
const pack = (dx, dy, dz) => ((dx + HALF) * STRIDE + (dy + HALF)) * STRIDE + (dz + HALF);

const DIRS = [
   { x: 0, y: 1, z: 0 },
   { x: 0, y: -1, z: 0 },
];

export const detectTree = (startBlock, logId, leafId) => {
   const dim = startBlock.dimension;
   const startLoc = startBlock.location;
   const originX = startLoc.x;
   const originY = startLoc.y;
   const originZ = startLoc.z;

   const locations = [];
   const visited = new Set();
   const queue = [startLoc];
   const cache = new Map();

   const probe = { x: 0, y: 0, z: 0 };

   let head = 0;
   let foundLeaf = false;

   const getBlockCached = (loc) => {
      const key = pack(loc.x - originX, loc.y - originY, loc.z - originZ);
      if (cache.has(key)) return cache.get(key);
      const block = getBlockSafe(dim, loc);
      cache.set(key, block);
      return block;
   };

   visited.add(pack(0, 0, 0));

   while (head < queue.length && locations.length < CFG.maxBlocksPerTree) {
      const curLoc = queue[head++];
      const cx = curLoc.x,
         cy = curLoc.y,
         cz = curLoc.z;

      const block = getBlockCached(curLoc);
      if (!block || block.typeId !== logId) continue;

      locations.push(curLoc);

      if (!foundLeaf) {
         for (const offset of LEAF_OFFSETS) {
            probe.x = cx + offset.x;
            probe.y = cy + offset.y;
            probe.z = cz + offset.z;
            const checkBlock = getBlockCached(probe);
            if (checkBlock && checkBlock.typeId === leafId) {
               foundLeaf = true;
               break;
            }
         }
      }

      for (const d of DIRS) {
         const nx = cx + d.x,
            ny = cy + d.y,
            nz = cz + d.z;
         const nKey = pack(nx - originX, ny - originY, nz - originZ);
         if (!visited.has(nKey)) {
            visited.add(nKey);
            queue.push({ x: nx, y: ny, z: nz });
         }
      }
   }

   return { locations: locations, foundLeaf: foundLeaf };
};
