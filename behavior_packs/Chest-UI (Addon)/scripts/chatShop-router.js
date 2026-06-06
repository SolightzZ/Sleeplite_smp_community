import { system, world } from '@minecraft/server';
import shopDatabase from './ChatShop/core/database.js';
import shopEngine from './ChatShop/core/engine.js';

system.run(() => {
    shopDatabase.load();
});

world.beforeEvents.playerInteractWithBlock.subscribe((ev) => {
    const player = ev.player;
    if (!player?.isValid) return;
    try {
        shopEngine.onShopInteract(ev);
    } catch (e) {
        console.error('[ChatShop] interact:', e);
    }
});

world.beforeEvents.playerBreakBlock.subscribe((ev) => {
    const player = ev.player;
    if (!player?.isValid) return;
    try {
        shopEngine.onShopBreak(ev);
    } catch (e) {
        console.error('[ChatShop] break:', e);
    }
});

world.beforeEvents.explosion.subscribe((ev) => {
    try {
        shopEngine.onShopExplosion(ev);
    } catch (e) {
        console.error('[ChatShop] explosion:', e);
    }
});
