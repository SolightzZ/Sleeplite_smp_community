export function worldName(id) {
  return id
    .replace("minecraft:", "")
    .split("_")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

export function posInt(p) {
  return {
    x: Math.floor(p.x),
    y: Math.floor(p.y),
    z: Math.floor(p.z),
  };
}
