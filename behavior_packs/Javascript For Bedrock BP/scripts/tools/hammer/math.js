import { math } from "./constants.js";

export const distSq = (v1) => (v2) => (v1.x - v2.x) ** 2 + (v1.y - v2.y) ** 2 + (v1.z - v2.z) ** 2;

export const getPlane = (rot) => {
  if (Math.abs(rot.x) > math.ANGLE_LOW) return math.AXIS_Y;
  if (Math.abs(rot.y) > math.ANGLE_LOW && Math.abs(rot.y) < math.ANGLE_HIGH) return math.AXIS_X;
  return math.AXIS_Z;
};

export const generateGrid = (center, rot, radius) => {
  const plane = getPlane(rot);
  const vectors = [];

  for (let i = -radius; i <= radius; i++) {
    for (let j = -radius; j <= radius; j++) {
      let dx = 0,
        dy = 0,
        dz = 0;

      if (plane === math.AXIS_Y) {
        dx = i;
        dz = j;
      } else if (plane === math.AXIS_X) {
        dz = i;
        dy = j;
      } else {
        dx = i;
        dy = j;
      }

      vectors.push({
        x: center.x + dx,
        y: center.y + dy,
        z: center.z + dz,
      });
    }
  }
  return vectors;
};

export const sortByDistance = (center) => (a, b) => {
  const distanceToCenter = distSq(center);
  return distanceToCenter(a) - distanceToCenter(b);
};
