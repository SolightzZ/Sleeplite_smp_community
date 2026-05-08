import { world } from "@minecraft/server";
import { zone } from "./rules.js";

const count = (block) => {
  if (!block || !block.isValid) return 0;
  const { x, y, z } = block.location;
  const dimId = block.dimension.id;
  const zoneSq = zone * zone;
  let n = 0;
  for (const player of world.getAllPlayers()) {
    if (!player.isValid) continue;
    if (player.dimension.id !== dimId) continue;
    const loc = player.location;
    const dx = loc.x - x, dy = loc.y - y, dz = loc.z - z;
    if (dx * dx + dy * dy + dz * dz <= zoneSq) n++;
  }
  return n;
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
