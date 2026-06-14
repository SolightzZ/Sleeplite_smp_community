import { Registry } from '../../router/core/registry.js';
import { zone } from './rules.js';

export const count = (block) => {
    if (!block || !block.isValid) return 0;

    const loc = block.location;
    const dimId = block.dimension.id;
    const zoneSq = zone * zone;

    // ดึงผู้เล่นผ่านแคช Registry เพื่อลดการทำงานแบบ O(N)
    const players = Registry.getPlayers();
    let nearbyCount = 0;

    for (const player of players) {
        if (!player.isValid) continue;
        if (player.dimension.id !== dimId) continue;

        const playerLoc = player.location;
        const dx = playerLoc.x - loc.x;
        const dy = playerLoc.y - loc.y;
        const dz = playerLoc.z - loc.z;

        if (dx * dx + dy * dy + dz * dz <= zoneSq) nearbyCount++;
    }

    return nearbyCount;
};

export const fix = (text) => {
    const raw = text.split(':')[1] || text;
    const words = raw.split('_');
    const len = words.length;

    for (let i = 0; i < len; i++) {
        const word = words[i];
        words[i] = word[0].toUpperCase() + word.slice(1);
    }

    return words.join(' ');
};
