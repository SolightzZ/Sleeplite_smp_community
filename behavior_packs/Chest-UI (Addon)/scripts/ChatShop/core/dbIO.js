import { world } from '@minecraft/server';
import { CONFIG } from '../config.js';

class DbIO {
    loadRaw = () => {
        const countKey = CONFIG.dbIndexKey;
        const count = parseInt(world.getDynamicProperty(countKey) ?? '0', 10);
        if (count <= 0) return null;

        return Array.from({ length: count })
            .map((_, i) => world.getDynamicProperty(`${CONFIG.dbPrefix}data:${i}`))
            .filter(Boolean)
            .join('');
    };

    saveRaw = (jsonStr) => {
        const maxSize = CONFIG.dbMaxChunkSize;
        const countKey = CONFIG.dbIndexKey;

        const oldCount = parseInt(world.getDynamicProperty(countKey) ?? '0', 10);
        Array.from({ length: oldCount }).forEach((_, i) => {
            world.setDynamicProperty(`${CONFIG.dbPrefix}data:${i}`);
        });

        if (!jsonStr || jsonStr === '{}') {
            world.setDynamicProperty(countKey);
            return;
        }

        const chunks = jsonStr.match(new RegExp('.{1,' + maxSize + '}', 'g')) || [];

        world.setDynamicProperty(countKey, String(chunks.length));
        chunks.forEach((chunk, i) => {
            world.setDynamicProperty(`${CONFIG.dbPrefix}data:${i}`, chunk);
        });
    };
}

export default new DbIO();
