export const Config = {
    MaxZones: 10,
    ZoneSize: 30,
    MaxFriends: 4,
    ParticleId: 'minecraft:endrod',
    ParticleStep: 3,
    BorderDuration: 60,
    CacheLimit: 1000,
    AdminTag: 'admin',
    ExplosionRadius: 8,
    RequiredBlock: 'minecraft:diamond_block',
    DefaultFlags: {
        break: true,
        place: true,
        interact: true,
        container: true,
        damage: false,
    },
};

export const halfZoneSize = Config.ZoneSize / 2;

export const Colors = {
    Error: '§c',
    Success: '§a',
    Warning: '§6',
    Info: '§7',
};

// ฟังก์ชันสร้างตำแหน่งขอบเขต
export const buildEdgeOffsets = (size) => {
    const offsets = [];
    const zero = 0;
    const zoneSize = size;
    const axes = [zero, zoneSize];
    const axesLen = axes.length;

    for (let outerIndex = 0; outerIndex < axesLen; outerIndex++) {
        const fixedY = axes[outerIndex];
        for (let innerIndex = 0; innerIndex < axesLen; innerIndex++) {
            offsets.push(['x', zero, fixedY, axes[innerIndex]]);
        }
    }

    for (let outerIndex = 0; outerIndex < axesLen; outerIndex++) {
        const fixedX = axes[outerIndex];
        for (let innerIndex = 0; innerIndex < axesLen; innerIndex++) {
            offsets.push(['y', fixedX, zero, axes[innerIndex]]);
        }
    }

    for (let outerIndex = 0; outerIndex < axesLen; outerIndex++) {
        const fixedX = axes[outerIndex];
        for (let innerIndex = 0; innerIndex < axesLen; innerIndex++) {
            offsets.push(['z', fixedX, axes[innerIndex], zero]);
        }
    }

    return offsets;
};

export const edgeOffsets = buildEdgeOffsets(Config.ZoneSize);
