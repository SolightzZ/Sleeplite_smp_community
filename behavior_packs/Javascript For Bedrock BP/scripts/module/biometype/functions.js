import { biomeIdList, EXCLUDED_BIOMES } from "./database.js";

export const getBiomeIdAtLocation = (player) => {
  if (!player?.location || !player?.dimension) return null;
  try {
    return player.dimension.getBiome(player.location)?.id ?? null;
  } catch (e) {
    console.warn("GetBiomeIdAtLocation: " + e);
    return null;
  }
};

export const getBiomeName = (biomeId) => {
  if (!biomeId) return null;
  return EXCLUDED_BIOMES.includes(biomeId)
    ? null
    : biomeIdList[biomeId] || biomeId;
};

export const getDimensionName = (dimensionId) => {
  return biomeIdList[dimensionId] || dimensionId || "Unknown Dimension";
};
