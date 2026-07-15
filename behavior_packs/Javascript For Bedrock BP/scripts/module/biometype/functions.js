import { logError } from '../../events/logger.js';
import { pcheck } from './../../shared/player.js';
import { biomeIdList, EXCLUDED_BIOMES } from './database.js';

const formatIdName = (id) => {
   if (!id) return 'Unknown';

   return id
      .split(':')
      .pop()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getBiomeIdAtLocation = (player) => {
   if (!pcheck(player)) return null;

   try {
      return player.dimension.getBiome(player.location)?.id ?? null;
   } catch (error) {
      logError('BiomeType', 'getBiomeIdAtLocation', error);
      return null;
   }
};

const getBiomeName = (biomeId) => {
   if (!biomeId || EXCLUDED_BIOMES.has(biomeId)) {
      return null;
   }

   return biomeIdList[biomeId] ?? formatIdName(biomeId);
};

const getDimensionName = (dimensionId) => {
   return biomeIdList[dimensionId] ?? formatIdName(dimensionId);
};

export { getBiomeIdAtLocation, getBiomeName, getDimensionName };
