export const trunc2 = (n) => Math.floor(n * 100) / 100;

export const seatHasMoved = (locA, locB) =>
  trunc2(locA.x) !== trunc2(locB.x) ||
  trunc2(locA.y) !== trunc2(locB.y) ||
  trunc2(locA.z) !== trunc2(locB.z);
