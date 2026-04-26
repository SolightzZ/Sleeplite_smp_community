import { world } from "@minecraft/server";
import { zone } from "./rules.js";

function gap(a, b) {
  const x = a.x - b.x;
  const y = a.y - b.y;
  const z = a.z - b.z;
  return Math.sqrt(x * x + y * y + z * z);
}

export function count(block) {
  const all = world.getPlayers();
  const near = all.filter((p) => gap(p.location, block.location) <= zone);
  return near.length;
}

export function fix(text) {
  const raw = text.split(":")[1] || text;
  const words = raw.split("_");
  const nice = words.map((word) => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  });
  return nice.join(" ");
}
