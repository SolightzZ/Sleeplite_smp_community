import { EntityDamageCause } from '@minecraft/server';
import { logError } from '../../events/logger.js';
import { cache } from '../../shared/cache.js';
import { pcheck } from './../../shared/player.js';
import { getHead } from './data.js';
import { getKillerName, posInt, worldName } from './util.js';
import { dimEnd, endSpawnY, loreDimension, loreKiller, loreLocation, msgDied, msgDropError } from './config.js';

export const dropHead = (player, dmg) => {
   try {
      if (!pcheck(player)) return;

      const name = player.name;
      const dim = player.dimension;
      const loc = player.location;
      const pos = posInt(loc);
      const dimName = worldName(dim.id);

      cache.sendMessage(player, msgDied.replace('{name}', name).replace('{x}', pos.x).replace('{y}', pos.y).replace('{z}', pos.z).replace('{dim}', dimName));

      const headId = getHead(name);
      if (!headId) return;

      const killer = getKillerName(player, dmg);

      const item = cache.createItemStack(headId, 1);
      item.setLore([loreKiller.replace('{killer}', killer), loreLocation.replace('{x}', pos.x).replace('{y}', pos.y).replace('{z}', pos.z), loreDimension.replace('{dim}', dimName)]);

      if (dmg?.cause === EntityDamageCause.void) {
         const minY = dim.heightRange.min + 1;
         if (dim.id === dimEnd) {
            pos.y = endSpawnY;
         } else {
            pos.y = Math.max(pos.y, minY);
         }
      }

      dim.spawnItem(item, pos);
   } catch (error) {
      logError('Drophead', 'dropHead ' + player.name, error);
      cache.sendMessage(player, msgDropError.replace('{name}', player.name));
   }
};
