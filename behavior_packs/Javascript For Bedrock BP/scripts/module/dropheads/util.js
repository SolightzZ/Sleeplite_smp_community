const dimNames = {
  "minecraft:overworld": "Overworld",
  "minecraft:nether": "Nether",
  "minecraft:the_end": "The End",
};

const upperFirst = (str) => {
  if (!str) return "";
  return str[0].toUpperCase() + str.slice(1);
};

export const worldName = (id) => {
  if (dimNames[id]) return dimNames[id];

  const clean = id.replace("minecraft:", "");
  const parts = clean.split("_");
  const len = parts.length;
  const result = [];

  for (let i = 0; i < len; i++) {
    result.push(upperFirst(parts[i]));
  }

  return result.join(" ");
};

export const posInt = (p) => ({
  x: Math.floor(p.x),
  y: Math.floor(p.y),
  z: Math.floor(p.z),
});
