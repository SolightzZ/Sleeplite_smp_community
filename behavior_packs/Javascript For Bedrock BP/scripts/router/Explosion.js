import { world } from "@minecraft/server";
import { onExplosion } from "../module/protection/core/events.js";

world.beforeEvents.explosion.subscribe((event) => {
    try {
        onExplosion(event);
    } catch (error) {
        console.error('[ Explosion ] error:', error?.message ?? error);
    }
});
