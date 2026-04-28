import { system, Player } from "@minecraft/server";
import {
  getBiomeIdAtLocation,
  getBiomeName,
  getDimensionName,
} from "./functions.js";
import { Colors } from "./constants.js";

export const handlePlayerDimensionChange = ({ player }) => {
  if (player?.typeId !== "minecraft:player" || !player.isValid) return;
  
  const dimensionId = player.dimension.id;
  const dimensionName = getDimensionName(dimensionId);
  const biomeId = getBiomeIdAtLocation(player);
  const biomeName = getBiomeName(biomeId) || "";

  system.runTimeout(() => {
    if (!player.isValid) return;
    const title = `${Colors.gold}${dimensionName}`;
    const options = {
      stayDuration: 150,
      fadeInDuration: 10,
      fadeOutDuration: 80,
    };
    if (biomeName) {
      options.subtitle = `${Colors.white}${biomeName}`;
    }
    player.onScreenDisplay.setTitle(title, options);
  }, 60);
};
