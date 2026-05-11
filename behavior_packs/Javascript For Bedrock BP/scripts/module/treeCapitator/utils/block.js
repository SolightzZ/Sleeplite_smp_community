export const getBlockSafe = (dim, loc) => {
  try {
    return dim.getBlock(loc);
  } catch (e) {
    console.error("[ treeCapitator ] block: " + e);
    return undefined;
  }
};
