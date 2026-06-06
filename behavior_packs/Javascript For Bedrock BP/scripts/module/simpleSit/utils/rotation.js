const yawTable = [90, 270, 180, 0];

export const weirdoToRotation = (dir) => {
    return { x: 0, y: yawTable[dir] || 0 };
};
