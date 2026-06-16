import { shop } from './rules.js';

const memory = new Map();
const MEMORY_MAX = 500;
let counter = 1;

const evictStale = () => {
    if (memory.size < MEMORY_MAX) return;
    const iter = memory.keys();
    for (let i = 0; i < 64; i++) {
        const key = iter.next().value;
        if (key === undefined) break;
        memory.delete(key);
    }
};

export const ask = (block) => {
    if (!block || !block.isValid) return shop[0];

    const loc = block.location;
    const key = `${block.dimension.id}_${loc.x}_${loc.y}_${loc.z}`;

    if (memory.has(key)) return memory.get(key);

    evictStale();

    const idx = (counter - 1) % shop.length;
    const gift = shop[idx];
    const data = { id: gift.id, hp: gift.hp };

    memory.set(key, data);
    counter++;

    return data;
};

export const forget = (block) => {
    if (!block || !block.isValid) return;

    const loc = block.location;
    const key = `${block.dimension.id}_${loc.x}_${loc.y}_${loc.z}`;
    memory.delete(key);
};
