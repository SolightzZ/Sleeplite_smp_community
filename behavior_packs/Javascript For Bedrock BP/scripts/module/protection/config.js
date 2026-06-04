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

export const HalfZoneSize = Config.ZoneSize / 2;

export const Colors = {
    Error: '§c',
    Success: '§a',
    Warning: '§6',
    Info: '§7',
};

export const buildEdgeOffsets = (size) => {
    const offsets = [];
    const zero = 0;
    const z = size;
    const axes = [zero, z];
    const axesLen = axes.length;

    for (let i = 0; i < axesLen; i++) {
        const y = axes[i];
        for (let j = 0; j < axesLen; j++) {
            offsets.push(['x', zero, y, axes[j]]);
        }
    }

    for (let i = 0; i < axesLen; i++) {
        const x = axes[i];
        for (let j = 0; j < axesLen; j++) {
            offsets.push(['y', x, zero, axes[j]]);
        }
    }

    for (let i = 0; i < axesLen; i++) {
        const x = axes[i];
        for (let j = 0; j < axesLen; j++) {
            offsets.push(['z', x, axes[j], zero]);
        }
    }

    return offsets;
};

export const EdgeOffsets = buildEdgeOffsets(Config.ZoneSize);
