import { world } from "@minecraft/server";
import { zone } from "./rules.js";

export const count = (block) => {
  if (!block || !block.isValid) return 0;

  const loc = block.location;
  const dimId = block.dimension.id;
  const zoneSq = zone * zone;

  const players = world.getAllPlayers();
  const len = players.length;
  let n = 0;

  for (let i = 0; i < len; i++) {
    const p = players[i];
    if (!p.isValid) continue;
    if (p.dimension.id !== dimId) continue;

    const ploc = p.location;
    const dx = ploc.x - loc.x;
    const dy = ploc.y - loc.y;
    const dz = ploc.z - loc.z;

    if (dx * dx + dy * dy + dz * dz <= zoneSq) n++;
  }

  return n;
};


export const fix = (text) => {
  const raw = text.split(":")[1] || text;
  const words = raw.split("_");
  const len = words.length;

  for (let i = 0; i < len; i++) {
    const w = words[i];
    words[i] = w[0].toUpperCase() + w.slice(1);
  }

  return words.join(" ");
};
