import { world } from "@minecraft/server";
import { zone } from "./rules.js";

export const count = (block) => {
  return world.getPlayers({
    location: block.location,
    maxDistance: zone,
  }).length;
};

export const fix = (text) => {
  const raw = text.split(":")[1] || text;
  const words = raw.split("_");
  const nice = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1));
  return nice.join(" ");
};
