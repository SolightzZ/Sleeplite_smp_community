import { getBlockSafe } from '../../../shared/block.js';
import { DIRECTIONS } from '../constants.js';
import { CFG } from '../config.js';

const HALF = CFG.maxBlocksPerVein + 2;
const STRIDE = HALF * 2;
const DIR_COUNT = DIRECTIONS.length;

const packOffset = (dx, dy, dz) => ((dx + HALF) * STRIDE + (dy + HALF)) * STRIDE + (dz + HALF);

export const scanVein = (startBlock, targetId) => {
   const dim = startBlock.dimension;
   const startLoc = startBlock.location;
   const originX = startLoc.x;
   const originY = startLoc.y;
   const originZ = startLoc.z;
   const maxBlocks = CFG.maxBlocksPerVein;

   const locations = [];
   const visited = new Set();
   visited.add(packOffset(0, 0, 0));

   const queue = [startLoc];
   let head = 0;

   const probe = { x: 0, y: 0, z: 0 };

   while (head < queue.length && locations.length < maxBlocks) {
      const curLoc = queue[head++];
      locations.push(curLoc);

      for (let i = 0; i < DIR_COUNT; i++) {
         const dir = DIRECTIONS[i];
         const nx = curLoc.x + dir.x;
         const ny = curLoc.y + dir.y;
         const nz = curLoc.z + dir.z;

         const key = packOffset(nx - originX, ny - originY, nz - originZ);
         if (visited.has(key)) continue;
         visited.add(key);

         probe.x = nx;
         probe.y = ny;
         probe.z = nz;
         const block = getBlockSafe(dim, probe);
         if (block && block.typeId === targetId) {
            queue.push({ x: nx, y: ny, z: nz });
         }
      }
   }

   return { locations: locations };
};
