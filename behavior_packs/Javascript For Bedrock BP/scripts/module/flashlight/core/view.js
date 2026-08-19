import { THRESHOLD_MOVE, WORLD_Y_MAX, WORLD_Y_MIN } from '../config.js';
import { playerLastPos } from './state.js';

const _dimBounds = new Map();

function getDimBounds(dimension) {
   const cached = _dimBounds.get(dimension.id);
   if (cached) return cached;
   const range = dimension.heightRange;
   const b = { min: range ? range.min : WORLD_Y_MIN, max: range ? range.max : WORLD_Y_MAX };
   _dimBounds.set(dimension.id, b);
   return b;
}

export function calcLightPos(pos, dimension) {
   const b = getDimBounds(dimension);
   const y = Math.floor(pos.y) + 2;
   if (y < b.min || y > b.max) return null;
   return {
      x: Math.floor(pos.x),
      y,
      z: Math.floor(pos.z),
   };
}

export function hasPlayerMoved(playerId, pos) {
   const last = playerLastPos.get(playerId);
   if (!last) {
      playerLastPos.set(playerId, { x: pos.x, y: pos.y, z: pos.z });
      return true;
   }

   const dx = Math.abs(last.x - pos.x);
   const dy = Math.abs(last.y - pos.y);
   const dz = Math.abs(last.z - pos.z);

   if (dx < THRESHOLD_MOVE && dy < THRESHOLD_MOVE && dz < THRESHOLD_MOVE) {
      return false;
   }

   last.x = pos.x;
   last.y = pos.y;
   last.z = pos.z;
   return true;
}
