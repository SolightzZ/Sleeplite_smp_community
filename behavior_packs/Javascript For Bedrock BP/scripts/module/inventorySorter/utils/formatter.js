export const formatBlockName = (typeId) => {
    const raw = typeId ? typeId.replace('minecraft:', '') : 'unknown';
    const parts = raw.split('_');
    let out = '';

    for (let i = 0; i < parts.length; i++) {
        if (i > 0) out += ' ';
        out += parts[i].charAt(0).toUpperCase() + parts[i].slice(1);
    }

    return out;
};

export const getItemDisplayName = (item) => {
    if (!item?.typeId) return 'zzz';
    if (item.nameTag) return item.nameTag.toLowerCase();

    const raw = item.typeId.replace('minecraft:', '');
    const parts = raw.split('_');
    let out = '';

    for (let i = 0; i < parts.length; i++) {
        if (i > 0) out += ' ';
        out += parts[i].charAt(0).toUpperCase() + parts[i].slice(1);
    }

    return out.toLowerCase();
};

export const getItemDurability = (item) => {
    if (!item) return 0;
    const comp = item.getComponent('minecraft:durability');

    if (!comp) return 100;
    const max = comp.maxDurability;

    if (!max) return 100;
    return ((max - (comp.damage || 0)) / max) * 100;
};
