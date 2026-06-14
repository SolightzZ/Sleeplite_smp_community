import { CONFIG } from '../config.js';

export const isAdmin = (player) => {
    if (!player || !player.hasTag) return false;
    return player.hasTag(CONFIG.adminTag);
};
