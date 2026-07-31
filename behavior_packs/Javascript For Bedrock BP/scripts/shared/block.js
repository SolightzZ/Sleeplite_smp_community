export const getDimLocKey = (dimId, x, y, z) => `${dimId} ${x},${y},${z}`;

export const getBlockSafe = (dim, loc) => {
   try {
      return dim.getBlock(loc);
   } catch {
      return undefined;
   }
};
