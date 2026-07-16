import { MagnetConfig } from '../config.js';
import { hasMagnetUser } from './state.js';
import { pcheck } from './../../../shared/player.js';

export const pullItemsToPlayer = (player) => {
    if (!pcheck(player) || !hasMagnetUser(player.id)) return;

    const loc = player.location;
    const target = { x: loc.x, y: loc.y + 0.8, z: loc.z };
    const dimension = player.dimension;
    let pulledCount = 0;

    for (const typeId of MagnetConfig.PULLABLE_TYPES) {
        if (pulledCount >= MagnetConfig.MAX_ITEMS) break;

        const entities = dimension.getEntities({
            location: loc,
            maxDistance: MagnetConfig.RANGE,
            type: typeId,
        });

        for (const entity of entities) {
            if (pulledCount >= MagnetConfig.MAX_ITEMS) break;
            if (!entity.isValid) continue;
            try {
                entity.teleport(target, { dimension });
            } catch {
                continue;
            }
            pulledCount++;
        }
    }
};
