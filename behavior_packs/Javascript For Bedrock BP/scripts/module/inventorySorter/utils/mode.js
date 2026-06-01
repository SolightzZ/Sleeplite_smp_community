import { SortModes } from '../config.js';

export const normalizeMode = (mode) => {
    let m = mode;
    if (typeof mode === 'number') {
        const keys = Object.keys(SortModes);
        m = keys[mode] ?? 'type';
    }

    const key = (m ?? 'type').toString().toLowerCase();
    const entry = SortModes[key] ?? SortModes.type;

    return entry?.value ?? 'type';
};
