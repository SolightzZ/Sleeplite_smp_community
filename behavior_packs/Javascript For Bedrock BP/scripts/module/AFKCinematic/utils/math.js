export const normalizeYaw = (y) => ((((y + 180) % 360) + 360) % 360) - 180;
export const angleDiff = (a, b) => Math.abs(normalizeYaw(a - b));

export const hashStr = (s) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
};
