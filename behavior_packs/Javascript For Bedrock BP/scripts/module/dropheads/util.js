import { EntityDamageCause } from '@minecraft/server';

const dimNames = {
    'minecraft:overworld': 'Overworld',
    'minecraft:nether': 'Nether',
    'minecraft:the_end': 'The End',
};

const upperFirst = (str) => {
    if (!str) return '';
    return str[0].toUpperCase() + str.slice(1);
};

const formatName = (id) => {
    if (!id) return 'Unknown';

    return id.replace('minecraft:', '').replace(/_/g, ' ').split(' ').map(upperFirst).join(' ');
};

export const worldName = (id) => {
    return dimNames[id] || formatName(id);
};

export const posInt = (p) => ({
    x: Math.floor(p.x),
    y: Math.floor(p.y),
    z: Math.floor(p.z),
});

export const getKillerName = (player, dmg) => {
    const src = dmg?.damagingEntity;
    const cause = dmg?.cause;

    if (src?.isValid) {
        if (src.typeId === 'minecraft:player') {
            return src.id === player.id ? 'Suicide' : src.name;
        }

        return formatName(src.typeId);
    }

    switch (cause) {
        case EntityDamageCause.suicide:
            return 'Suicide';

        case EntityDamageCause.fall:
            return 'Fall Damage';

        case EntityDamageCause.fire:
        case EntityDamageCause.fireTick:
            return 'Fire';

        case EntityDamageCause.lava:
            return 'Lava';

        case EntityDamageCause.drowning:
            return 'Drowning';

        case EntityDamageCause.freezing:
            return 'Freezing';

        case EntityDamageCause.starve:
            return 'Starvation';

        case EntityDamageCause.void:
            return 'The Void';

        case EntityDamageCause.magic:
            return 'Magic';

        case EntityDamageCause.wither:
            return 'Wither';

        case EntityDamageCause.thorns:
            return 'Thorns';

        case EntityDamageCause.projectile:
            return 'Projectile';

        case EntityDamageCause.entityExplosion:
            return 'Entity Explosion';

        case EntityDamageCause.blockExplosion:
            return 'Block Explosion';

        case EntityDamageCause.suffocation:
            return 'Suffocation';

        case EntityDamageCause.contact:
            return 'Contact Damage';

        case EntityDamageCause.anvil:
            return 'Anvil';

        case EntityDamageCause.fallingBlock:
            return 'Falling Block';

        case EntityDamageCause.lightning:
            return 'Lightning';

        case EntityDamageCause.temperature:
            return 'Temperature';

        case EntityDamageCause.override:
            return 'Command';

        default:
            return formatName(cause);
    }
};
