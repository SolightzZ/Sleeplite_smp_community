const DOOR_SUFFIX = '_door';
const TRAP_KEYWORD = 'trap';

const NEIGHBOR_GETTERS = [
   (block) => block.east(),
   (block) => block.west(),
   (block) => block.north(),
   (block) => block.south(),
];

function isDoorBlock(block) {
   const typeId = block.typeId;
   return typeId.endsWith(DOOR_SUFFIX) && !typeId.includes(TRAP_KEYWORD);
}

function syncAdjacentDoor(sourceBlock, openBit, cardinalDirection) {
   for (const getNeighbor of NEIGHBOR_GETTERS) {
      const neighbor = getNeighbor(sourceBlock);
      if (!isDoorBlock(neighbor)) continue;

      const permutation = neighbor.permutation;
      const neighborDirection = permutation.getState('minecraft:cardinal_direction');
      if (neighborDirection !== cardinalDirection) continue;

      neighbor.setPermutation(permutation.withState('open_bit', openBit));
   }
}

export const openDoor = (event) => {
   try {
      if (!event?.block) return;

      const block = event.block;
      if (!isDoorBlock(block)) return;

      const permutation = block.permutation;
      const cardinalDirection = permutation.getState('minecraft:cardinal_direction');
      const openBit = permutation.getState('open_bit');

      syncAdjacentDoor(block, openBit, cardinalDirection);
   } catch (error) {
      console.error(`[OpenDoor] openDoor failed for ${event?.block?.typeId}: ${error.message}`);
   }
};
