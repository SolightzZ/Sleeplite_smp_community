export const getBlockSafe = (dim, loc) => {
  try {
    return dim.getBlock(loc);
  } catch {
    return undefined;
  }
};
