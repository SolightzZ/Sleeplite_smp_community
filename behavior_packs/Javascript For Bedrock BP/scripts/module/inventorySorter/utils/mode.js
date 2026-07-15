import { defaultSortMode, SortModes } from '../config.js';

export const normalizeMode = (mode) => {
    let m = mode;
    if (typeof mode === 'number') {
        const keys = Object.keys(SortModes);
        m = keys[mode] ?? defaultSortMode;
    }

    const key = (m ?? defaultSortMode).toString().toLowerCase();
    const entry = SortModes[key] ?? SortModes.type;

    return entry?.value ?? defaultSortMode;
};
