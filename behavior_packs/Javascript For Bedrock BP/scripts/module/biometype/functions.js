import { biomeIdList, EXCLUDED_BIOMES } from "./database.js";

const getBiomeIdAtLocation = (player) => {
  try {
    if (!player?.location || !player?.dimension) return null;
    return player.dimension.getBiome(player.location)?.id ?? null;
    return null;
  } catch (error) {
    console.error("GetBiomeIdAtLocation: " + error);
  }
};

const getBiomeName = (biomeId) => {
  try {
    if (!biomeId) return null;
    return EXCLUDED_BIOMES.includes(biomeId)
      ? null
      : biomeIdList[biomeId] || biomeId;
  } catch (error) {
    console.error("getBiomeName: " + error);
  }
};

const getDimensionName = (dimensionId) => {
  try {
    return biomeIdList[dimensionId] || dimensionId || "Unknown Dimension";
  } catch (error) {
    console.error("getDimensionName: " + error);
  }
};

export { getBiomeIdAtLocation, getBiomeName, getDimensionName };
