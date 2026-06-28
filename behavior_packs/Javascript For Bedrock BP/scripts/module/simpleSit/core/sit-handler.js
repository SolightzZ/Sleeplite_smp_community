import { logError } from '../../../events/logger.js';
import { SEAT_ENTITY_ID, SEAT_NEAR_RADIUS } from '../config.js';
import { isBreathableBlock } from '../utils/block.js';
import { weirdoToRotation } from '../utils/rotation.js';
import { validatePlayerForSit } from '../utils/validation.js';
import { spawnSeat } from './seat-manager.js';

const SLAB = 'slab';
const STAIRS = 'stairs';
const VERTICAL_HALF = 'minecraft:vertical_half';
const UPSIDE_DOWN = 'upside_down_bit';
const WEIRDO_DIR = 'weirdo_direction';
const TOP = 'top';

export const handleSitCommand = (player) => {
   if (!player || !player.isValid) return;
   if (!validatePlayerForSit(player)) return;

   const dim = player.dimension;
   const loc = player.location;
   const px = Math.floor(loc.x);
   const py = loc.y;
   const pz = Math.floor(loc.z);

   const underLoc = { x: px, y: Math.floor(py - 0.1), z: pz };
   let underBlock;
   try {
      underBlock = dim.getBlock(underLoc);
   } catch (error) {
      logError('simpleSit', 'block', error);
      return;
   }

   const isSlab = underBlock?.typeId.includes(SLAB);
   const isStairs = underBlock?.typeId.includes(STAIRS);
   const isSpecial = underBlock && (isSlab || isStairs);

   let useSpecial = false;
   let spawnY = py - 1;
   let rot = { x: 0, y: player.getRotation().y };

   if (isSpecial) {
      const states = underBlock.permutation.getAllStates();
      const vertHalf = states[VERTICAL_HALF];
      const upsideDown = states[UPSIDE_DOWN];
      const weirdoDir = isStairs ? states[WEIRDO_DIR] : null;

      const flipped = (isSlab && vertHalf === TOP) || (isStairs && upsideDown === true);

      if (!flipped) {
         useSpecial = true;
         spawnY = underBlock.location.y;
         if (isStairs) rot = weirdoToRotation(weirdoDir);
      }
   }

   const headY = useSpecial ? Math.floor(spawnY) + 1 : Math.floor(py - 0.1) + 1;
   let blockAbove;
   try {
      blockAbove = dim.getBlock({ x: px, y: headY, z: pz });
   } catch (error) {
      logError('simpleSit', 'block', error);
      return;
   }

   if (!blockAbove || !isBreathableBlock(blockAbove.typeId)) {
      player.onScreenDisplay.setActionBar('§7Not enough headroom!');
      return;
   }

   const nearby = dim.getEntities({
      type: SEAT_ENTITY_ID,
      location: loc,
      maxDistance: SEAT_NEAR_RADIUS,
   });
   if (nearby.length > 0) return;

   const spawnLoc = {
      x: px + 0.5,
      y: useSpecial ? spawnY : py - 0.5,
      z: pz + 0.5,
   };

   spawnSeat(dim, spawnLoc, rot, player, undefined);
};
