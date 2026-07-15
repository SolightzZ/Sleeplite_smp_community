import { logError } from '../../../events/logger.js';
import { Config } from '../config.js';
import { getConfigSpawnProtec } from './database.js';

const DIM_OVERWORLD = 'minecraft:overworld';

export function inSpawnZoneSpawnProtec(location, dimensionId) {
   try {
      if (dimensionId !== DIM_OVERWORLD) return false;
      const c = getConfigSpawnProtec();
      if (!c) return false;
      if (!c.enabled) return false;
      const dx = Math.abs(location.x - c.centerX);
      const dz = Math.abs(location.z - c.centerZ);
      return dx <= c.radius && dz <= c.radius;
   } catch (error) {
      logError('SpawnProtec', 'inSpawnZoneSpawnProtec', error);
      return false;
   }
}

function isExemptSpawnProtec(player) {
   try {
      if (player.hasTag(Config.AdminTag)) return true;
      const c = getConfigSpawnProtec();
      if (!c) return false;
      return c.exemptSet.has(player.name.toLowerCase());
   } catch (error) {
      logError('SpawnProtec', 'isExemptSpawnProtec', error);
      return false;
   }
}

export function canSpawnProtec(flag, player) {
   try {
      const c = getConfigSpawnProtec();
      if (!c) return true;
      if (!c.enabled) return true;
      if (c.flags[flag]) return true;
      if (player) return isExemptSpawnProtec(player);
      return false;
   } catch (error) {
      logError('SpawnProtec', 'canSpawnProtec', error);
      return true;
   }
}
