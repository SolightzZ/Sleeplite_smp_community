import biomeIdList from "./database.js";
import { EXCLUDED_BIOMES } from "./constants.js";

export function getBiomeIdAtLocation(player) {
  const IfPlayer = player?.location || !player?.dimension;
  if (!IfPlayer) return null;
  try {
    return player.dimension.getBiome(player.location)?.id ?? null;
  } catch (e) {
    console.warn("GetBiomeIdAtLocation" + e);
    return null;
  }
}

export function getBiomeName(biomeId) {
  if (!biomeId) return null;
  return EXCLUDED_BIOMES.includes(biomeId) ? null : biomeIdList[biomeId] || biomeId;
}

export function getDimensionName(dimensionId) {
  return biomeIdList[dimensionId] || dimensionId || "Unknown Dimension";
}
