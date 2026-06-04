import { shop } from './rules.js';

const memory = new Map();
let counter = 1;

export const ask = (block) => {
    if (!block || !block.isValid) return shop[0];

    const loc = block.location;
    const key = `${block.dimension.id}_${loc.x}_${loc.y}_${loc.z}`;

    if (memory.has(key)) return memory.get(key);

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
