import { biomeIdList, EXCLUDED_BIOMES } from "./database.js";

const getBiomeIdAtLocation = (player) => {
  if (!player || !player.isValid) return null;
  try {
    return player.dimension.getBiome(player.location)?.id ?? null;
  } catch {
    return null; // Chunk may be unloaded
  }
};

const getBiomeName = (biomeId) => {
  if (!biomeId || EXCLUDED_BIOMES.has(biomeId)) return null;
  return biomeIdList[biomeId] || biomeId;
};

const getDimensionName = (dimensionId) => {
  return biomeIdList[dimensionId] || dimensionId || "Unknown Dimension";
};

export { getBiomeIdAtLocation, getBiomeName, getDimensionName };

