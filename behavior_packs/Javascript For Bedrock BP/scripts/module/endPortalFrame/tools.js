import { world } from "@minecraft/server";
import { zone } from "./rules.js";

const count = (block) => {
  return world.getPlayers({
    location: block.location,
    maxDistance: zone,
  }).length;
};

const fix = (text) => {
  const raw = text.split(":")[1] || text;
  const words = raw.split("_");
  const nice = words.map(
    (word) => word.charAt(0).toUpperCase() + word.slice(1),
  );
  return nice.join(" ");
};

export { count, fix };
