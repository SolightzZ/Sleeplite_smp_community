export const cloneVec3 = (v) => ({ x: v.x, y: v.y, z: v.z });
export const cloneVec2 = (v) => ({ x: v.x, y: v.y });

export const normalizeYaw = (y) => ((((y + 180) % 360) + 360) % 360) - 180;
export const angleDiff = (a, b) => Math.abs(normalizeYaw(a - b));

export const dist3 = (a, b) => {
    const dx = a.x - b.x,
        dy = a.y - b.y,
        dz = a.z - b.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

export const lerp3Into = (out, a, b, t) => {
    out.x = a.x + (b.x - a.x) * t;
    out.y = a.y + (b.y - a.y) * t;
    out.z = a.z + (b.z - a.z) * t;
    return out;
};

export const lerp3 = (a, b, t) => ({
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    z: a.z + (b.z - a.z) * t,
});

export const rotateRelInto = (out, yaw, fwd, right, up = 0) => {
    const r = (yaw * Math.PI) / 180;
    out.x = -Math.sin(r) * fwd + Math.cos(r) * right;
    out.y = up;
    out.z = Math.cos(r) * fwd + Math.sin(r) * right;
    return out;
};

export const rotateRel = (yaw, fwd, right, up = 0) => {
    const r = (yaw * Math.PI) / 180;
    return {
        x: -Math.sin(r) * fwd + Math.cos(r) * right,
        y: up,
        z: Math.cos(r) * fwd + Math.sin(r) * right,
    };
};

export const hashStr = (s) => {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h;
};

export const faceTargetInto = (rot, from, to) => {
    const dx = to.x - from.x,
        dy = to.y - from.y,
        dz = to.z - from.z;
    const horiz = Math.max(0.001, Math.sqrt(dx * dx + dz * dz));
    rot.pitch = -((Math.atan2(dy, horiz) * 180) / Math.PI);
    rot.yaw = normalizeYaw(-((Math.atan2(dx, dz) * 180) / Math.PI));
    return rot;
};

export const faceTarget = (from, to) => {
    const dx = to.x - from.x,
        dy = to.y - from.y,
        dz = to.z - from.z;
    const horiz = Math.max(0.001, Math.sqrt(dx * dx + dz * dz));
    return {
        pitch: -((Math.atan2(dy, horiz) * 180) / Math.PI),
        yaw: normalizeYaw(-((Math.atan2(dx, dz) * 180) / Math.PI)),
    };
};
