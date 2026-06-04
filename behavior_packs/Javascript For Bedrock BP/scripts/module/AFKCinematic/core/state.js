export const playerStates = new Map();

export const blockCache = new Map();

export const framePool = {
    rotation: { pitch: 0, yaw: 0 },
    desired: { x: 0, y: 0, z: 0 },
    target: { x: 0, y: 0, z: 0 },
    desiredOff: { x: 0, y: 0, z: 0 },
    targetOff: { x: 0, y: 0, z: 0 },
    safe: { x: 0, y: 0, z: 0 },
    sample: { x: 0, y: 0, z: 0 },
    lifted: { x: 0, y: 0, z: 0 },
};
