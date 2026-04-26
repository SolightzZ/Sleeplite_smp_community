export const getLocKey = (loc) => `${loc.x},${loc.y},${loc.z}`;

export const distSq = (v1) => (v2) => (v1.x - v2.x) ** 2 + (v1.y - v2.y) ** 2 + (v1.z - v2.z) ** 2;

export const sortByDistance = (center) => (a, b) => {
  const calcDist = distSq(center);
  return calcDist(a) - calcDist(b);
};
