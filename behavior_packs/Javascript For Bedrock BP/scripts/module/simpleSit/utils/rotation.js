export const weirdoToRotation = (direction) => {
  const yaw = [90, 270, 180, 0];
  return { x: 0, y: yaw[direction] ?? 0 };
};
