import { world } from "@minecraft/server";
import { zone } from "./rules.js";

const count = (block) => {
  if (!block || !block.isValid) return 0;
  return world.getPlayers({
    location: block.location,
    maxDistance: zone,
  }).length;
};

const fix = (text) => {
  const raw = text.split(":")[1] || text;
  const words = raw.split("_");
  const len = words.length;
  for (let i = 0; i < len; i++) {
    const word = words[i];
    words[i] = word.charAt(0).toUpperCase() + word.slice(1);
  }
  return words.join(" ");
};

export { count, fix };
