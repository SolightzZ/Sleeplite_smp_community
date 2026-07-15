import { MagnetConfig } from '../config.js';
import { hasMagnetUser } from './state.js';
import { pcheck } from './../../../shared/player.js';

const pullableSet = new Set(MagnetConfig.PULLABLE_TYPES);

export const pullItemsToPlayer = (player) => {
    if (!pcheck(player) || !hasMagnetUser(player.id)) return;

    const loc = player.location;
    const target = { x: loc.x, y: loc.y + 0.8, z: loc.z };
    let pulledCount = 0;

    const entities = player.dimension.getEntities({
        location: loc,
        maxDistance: MagnetConfig.RANGE,
    });

    for (const entity of entities) {
        if (pulledCount >= MagnetConfig.MAX_ITEMS) break;
        if (!entity.isValid) continue;
        if (!pullableSet.has(entity.typeId)) continue;
        entity.teleport(target, { dimension: player.dimension });
        pulledCount++;
    }
};
