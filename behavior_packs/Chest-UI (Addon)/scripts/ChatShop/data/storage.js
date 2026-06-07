import { world } from '@minecraft/server';
import { CONFIG } from '../config.js';

export function loadRaw() {
    const countKey = CONFIG.dbIndexKey;

    const count = parseInt(world.getDynamicProperty(countKey) ?? '0', 10);

    if (count <= 0) return null;

    const data = Array.from({ length: count })
        .map((_, i) => world.getDynamicProperty(`${CONFIG.dbPrefix}data:${i}`))
        .filter(Boolean)
        .join('');

    return data;
}

export function saveRaw(jsonData) {
    const maxSize = CONFIG.dbMaxChunkSize;

    const countKey = CONFIG.dbIndexKey;

    const oldCount = parseInt(world.getDynamicProperty(countKey) ?? '0', 10);

    if (oldCount > 0) {
        Array.from({ length: oldCount }).forEach((_, i) => {
            world.setDynamicProperty(`${CONFIG.dbPrefix}data:${i}`);
        });
    }

    if (!jsonData || jsonData === '{}') {
        world.setDynamicProperty(countKey);
        return;
    }

    const chunks = jsonData.match(new RegExp('.{1,' + maxSize + '}', 'g')) || [];

    world.setDynamicProperty(countKey, String(chunks.length));

    chunks.forEach((chunk, i) => {
        world.setDynamicProperty(`${CONFIG.dbPrefix}data:${i}`, chunk);
    });
}
