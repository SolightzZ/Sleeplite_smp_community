import { CONFIG } from "../config.js";

export const isAdmin = (player) => player.hasTag(CONFIG.adminTag);
