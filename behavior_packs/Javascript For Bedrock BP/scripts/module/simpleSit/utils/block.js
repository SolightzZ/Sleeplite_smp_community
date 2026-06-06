import { BREATHABLE_EXACT, BREATHABLE_PREFIX } from '../data/breathable.js';

export const isBreathableBlock = (typeId) => {
    if (BREATHABLE_EXACT.has(typeId)) return true;
    for (const prefix of BREATHABLE_PREFIX) {
        if (typeId.includes(prefix)) return true;
    }
    return false;
};

export const isRemovedBlock = (typeId) =>
    typeId === 'minecraft:air' ||
    typeId === 'minecraft:water' ||
    typeId === 'minecraft:flowing_water' ||
    typeId === 'minecraft:sticky_piston_arm_collision' ||
    typeId === 'minecraft:piston_arm_collision';
