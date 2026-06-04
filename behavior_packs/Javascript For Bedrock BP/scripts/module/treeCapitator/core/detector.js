import { getBlockSafe } from '../utils/block.js';
import { LEAF_OFFSETS } from '../constants.js';
import { CFG } from '../config.js';

export const detectTree = (startBlock, logId, leafId) => {
    const dim = startBlock.dimension;
    const locations = [];
    const visited = new Set();
    const queue = [startBlock.location];

    let head = 0;
    let foundLeaf = false;

    const makeKey = (x, y, z) => `${x},${y},${z}`;
    const startLoc = startBlock.location;
    visited.add(makeKey(startLoc.x, startLoc.y, startLoc.z));

    while (head < queue.length && locations.length < CFG.maxBlocksPerTree) {
        const curLoc = queue[head++];
        const cx = curLoc.x;
        const cy = curLoc.y;
        const cz = curLoc.z;

        const block = getBlockSafe(dim, curLoc);
        if (!block || block.typeId !== logId) continue;

        locations.push(curLoc);

        if (!foundLeaf) {
            const offsetsLen = LEAF_OFFSETS.length;
            for (let i = 0; i < offsetsLen; i++) {
                const off = LEAF_OFFSETS[i];
                const checkLoc = { x: cx + off.x, y: cy + off.y, z: cz + off.z };
                const checkBlock = getBlockSafe(dim, checkLoc);
                if (checkBlock && checkBlock.typeId === leafId) {
                    foundLeaf = true;
                    break;
                }
            }
        }

        const upKey = makeKey(cx, cy + 1, cz);
        const downKey = makeKey(cx, cy - 1, cz);

        if (!visited.has(upKey)) {
            visited.add(upKey);
            queue.push({ x: cx, y: cy + 1, z: cz });
        }
        if (!visited.has(downKey)) {
            visited.add(downKey);
            queue.push({ x: cx, y: cy - 1, z: cz });
        }
    }

    return { locations: locations, foundLeaf: foundLeaf };
};
