export const cloneVec3 = (vec) => ({ x: vec.x, y: vec.y, z: vec.z });
export const cloneVec2 = (vec) => ({ x: vec.x, y: vec.y });

export const normalizeYaw = (yaw) => ((((yaw + 180) % 360) + 360) % 360) - 180;
export const angleDiff = (yawA, yawB) => Math.abs(normalizeYaw(yawA - yawB));

export const dist3 = (pointA, pointB) => {
    const dx = pointA.x - pointB.x;
    const dy = pointA.y - pointB.y;
    const dz = pointA.z - pointB.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

export const lerp3Into = (out, from, to, progress) => {
    out.x = from.x + (to.x - from.x) * progress;
    out.y = from.y + (to.y - from.y) * progress;
    out.z = from.z + (to.z - from.z) * progress;
    return out;
};

export const rotateRelInto = (out, yaw, fwd, right, up = 0) => {
    const radians = (yaw * Math.PI) / 180;
    out.x = -Math.sin(radians) * fwd + Math.cos(radians) * right;
    out.y = up;
    out.z = Math.cos(radians) * fwd + Math.sin(radians) * right;
    return out;
};

export const hashString = (text) => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
    return hash;
};

export const faceTargetInto = (rot, from, to) => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dz = to.z - from.z;
    const horiz = Math.max(0.001, Math.sqrt(dx * dx + dz * dz));
    rot.pitch = -((Math.atan2(dy, horiz) * 180) / Math.PI);
    rot.yaw = normalizeYaw(-((Math.atan2(dx, dz) * 180) / Math.PI));
    return rot;
};
