import { system, world } from '@minecraft/server';
import { onShopInteract, onShopBreak, onShopExplosion } from './ChatShop/core/eventHandlers.js';
import shopDatabase from './ChatShop/data/database.js';

system.run(() => {
    shopDatabase.load();
});

function subscribeSafely(eventSignal, handler, getPlayer) {
    eventSignal.subscribe((event) => {
        const player = getPlayer?.(event);
        if (player && !player.isValid) return;
        handler(event);
    });
}

subscribeSafely(world.beforeEvents.playerInteractWithBlock, onShopInteract, (event) => event.player);

subscribeSafely(world.beforeEvents.playerBreakBlock, onShopBreak, (event) => event.player);

subscribeSafely(world.beforeEvents.explosion, onShopExplosion);
