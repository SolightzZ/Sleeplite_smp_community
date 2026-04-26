import { system, Player } from "@minecraft/server";
import { getBiomeIdAtLocation, getBiomeName, getDimensionName } from "./functions.js";
import { Colors } from "./constants.js";

export function handlePlayerDimensionChange(data) {
  const player = data.player;
  const IfPlayer = player instanceof Player || !player.isValid;

  if (!IfPlayer) return;
  const dimensionId = player.dimension.id;
  const dimensionName = getDimensionName(dimensionId);
  const biomeId = getBiomeIdAtLocation(player);
  const biomeName = getBiomeName(biomeId) || "";

  system.runTimeout(() => {
    const playerI = player.isValid;
    if (!playerI) return;
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
}

console.warn("Biome Type loaded successfully");
