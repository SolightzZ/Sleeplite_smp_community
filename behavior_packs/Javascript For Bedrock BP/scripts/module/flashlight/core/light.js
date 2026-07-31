import { BlockPermutation } from '@minecraft/server';
import { logError } from '../../../events/logger.js';
import { BLOCK_AIR, LIGHT_BLOCK, LIGHT_LEVEL } from '../config.js';

let _airPerm;
let _lightPerm;

const getAirPerm = () => _airPerm || (_airPerm = BlockPermutation.resolve(BLOCK_AIR));
const getLightPerm = () => _lightPerm || (_lightPerm = BlockPermutation.resolve(LIGHT_BLOCK, { block_light_level: LIGHT_LEVEL }));

export function placeLightBlock(targetBlock) {
   targetBlock.setPermutation(getLightPerm());
}

export function removeLightBlockAt(pos, dimension) {
   if (!pos || !dimension) return;
   try {
      const block = dimension.getBlock(pos);
      if (block && block.matches(LIGHT_BLOCK)) {
         block.setPermutation(getAirPerm());
      }
   } catch (error) {
      logError('flashlight', 'removeLightBlockAt', error);
   }
}
