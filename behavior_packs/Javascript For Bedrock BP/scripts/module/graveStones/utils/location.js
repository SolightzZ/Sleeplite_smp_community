export const floorPosition = (location) => ({
  x: Math.floor(location.x),
  y: Math.floor(location.y),
  z: Math.floor(location.z),
});

export const getGraveY = (dimensionId, y, rules) => {
  const rule = rules[dimensionId];
  return rule ? (y < rule.minY ? rule.baseY : y + 1) : y + 1;
};
