const generateDirections = () => {
  const dirs = [];
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        if (x === 0 && y === 0 && z === 0) continue;
        dirs.push({ x, y, z });
      }
    }
  }
  return dirs;
};

export const CONFIG = Object.freeze({
  HARVEST_LIMIT: 16,
  DIRECTIONS: Object.freeze(generateDirections()),
});
