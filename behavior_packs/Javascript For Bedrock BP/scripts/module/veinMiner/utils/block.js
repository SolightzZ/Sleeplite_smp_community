export const getLocKey = (x, y, z) => `${x},${y},${z}`;

export const getBlockSafe = (dim, loc) => {
  try {
    return dim.getBlock(loc);
  } catch (error) {
    console.error("[ veinMiner ] block: " + error);
    return undefined;
  }
};
