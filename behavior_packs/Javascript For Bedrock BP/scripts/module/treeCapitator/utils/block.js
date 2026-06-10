export const getBlockSafe = (dim, loc) => {
  try {
    return dim.getBlock(loc);
  } catch (error) {
    console.error("[ treeCapitator ] block: " + error);
    return undefined;
  }
};
