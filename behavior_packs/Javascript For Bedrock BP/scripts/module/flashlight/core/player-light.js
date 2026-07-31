import { logError } from '../../../events/logger.js';
import { cache } from '../../../shared/cache.js';
import { pcheck } from '../../../shared/player.js';
import { LIGHT_BLOCK } from '../config.js';
import { placeLightBlock, removeLightBlockAt } from './light.js';
import { playerLastPos, playerLights } from './state.js';
import { calcLightPos, hasPlayerMoved } from './view.js';

function resolveOldDim(oldLight) {
   try {
      return cache.getDimension(oldLight.dimId);
   } catch {
      return null;
   }
}

export function removeLightBlock(playerId) {
   const light = playerLights.get(playerId);
   if (!light) {
      playerLastPos.delete(playerId);
      return;
   }

   playerLights.delete(playerId);
   playerLastPos.delete(playerId);

   const dim = resolveOldDim(light);
   if (dim) removeLightBlockAt(light, dim);
}

export function placeLightForPlayer(player) {
   if (!pcheck(player)) return;

   const playerId = player.id;

   const pos = player.location;

   if (!hasPlayerMoved(playerId, pos)) return;

   const currentDim = player.dimension;
   const dimId = currentDim.id;
   const newPos = calcLightPos(pos, currentDim);
   const oldLight = playerLights.get(playerId);

   if (oldLight && newPos && oldLight.x === newPos.x && oldLight.y === newPos.y && oldLight.z === newPos.z && oldLight.dimId === dimId) return;

   if (!newPos) {
      if (oldLight) {
         const dim = resolveOldDim(oldLight);
         if (dim) removeLightBlockAt(oldLight, dim);
      }
      playerLights.delete(playerId);
      return;
   }

   try {
      if (oldLight) {
         const dim = resolveOldDim(oldLight);
         if (dim) removeLightBlockAt(oldLight, dim);
      }

      const targetBlock = currentDim.getBlock(newPos);
      if (!targetBlock) {
         playerLights.delete(playerId);
         playerLastPos.delete(playerId);
         return;
      }

      if (!targetBlock.isAir && !targetBlock.matches(LIGHT_BLOCK)) {
         playerLights.delete(playerId);
         playerLastPos.delete(playerId);
         return;
      }

      placeLightBlock(targetBlock);

      if (oldLight) {
         oldLight.x = newPos.x;
         oldLight.y = newPos.y;
         oldLight.z = newPos.z;
         oldLight.dimId = dimId;
      } else {
         playerLights.set(playerId, { x: newPos.x, y: newPos.y, z: newPos.z, dimId });
      }
   } catch (error) {
      playerLights.delete(playerId);
      logError('flashlight', 'placeLightForPlayer', error);
   }
}
