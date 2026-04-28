const dimNames = {
  "minecraft:overworld": "Overworld",
  "minecraft:nether": "Nether",
  "minecraft:the_end": "The End"
};

export const worldName = (id) => {
  if (dimNames[id]) return dimNames[id];
  return id
    .replace("minecraft:", "")
    .split("_")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
};

export const posInt = (p) => {
  return {
    x: Math.floor(p.x),
    y: Math.floor(p.y),
    z: Math.floor(p.z),
  };
};
