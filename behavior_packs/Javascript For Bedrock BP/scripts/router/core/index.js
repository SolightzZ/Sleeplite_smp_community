import { world } from '@minecraft/server';
import { runEventHandlers, runEventHandlersWithCancel } from './utils.js';
import { Registry } from './registry.js';

const HANDLERS = {
    beforeChatSend: [],
    afterItemUse: [],
    afterEntityDiePlayer: [],
    afterPlayerSpawn: [],
    afterPlayerJoin: [],
    beforePlayerLeave: [],
    afterPlayerLeave: [],
    beforeEntityHurt: [],
    afterEntitySpawnByType: new Map(),
    afterEntityDieByType: new Map(),
    beforeExplosion: [],
    beforePlayerBreakBlock: [],
    afterPlayerBreakBlock: [],
    afterPlayerDimensionChange: [],
    beforePlayerInteractBlock: [],
    afterPlayerInteractBlock: [],
    beforePlayerInteractEntity: [],
    beforePlayerPlaceBlock: []
};

export const router = {
    on(event, handler, options = {}) {
        const { typeId } = options;
        if (event === 'afterEntitySpawn' && typeId) {
            if (!HANDLERS.afterEntitySpawnByType.has(typeId)) {
                HANDLERS.afterEntitySpawnByType.set(typeId, []);
            }
            HANDLERS.afterEntitySpawnByType.get(typeId).push(handler);
            return;
        }
        if (event === 'afterEntityDie' && typeId) {
            if (!HANDLERS.afterEntityDieByType.has(typeId)) {
                HANDLERS.afterEntityDieByType.set(typeId, []);
            }
            HANDLERS.afterEntityDieByType.get(typeId).push(handler);
            return;
        }
        if (HANDLERS[event]) {
            HANDLERS[event].push(handler);
        } else {
            console.warn(`[Router] Unknown event type registered: ${event}`);
        }
    }
};

// เวิร์ลเริ่มต้นประมวลผลเสร็จสิ้น (worldLoad) ให้ดึงรายชื่อผู้เล่นที่ออนไลน์อยู่แล้วเข้า Registry
world.afterEvents.worldLoad.subscribe((event) => {
    Registry.init();
});

// ── สมัครรับเหตุการณ์เพียงครั้งเดียวต่อเหตุการณ์ ──

world.beforeEvents.chatSend.subscribe((event) => {
    const sender = event.sender;
    if (!sender || !sender.isValid) return;
    runEventHandlersWithCancel('ChatSend', HANDLERS.beforeChatSend, event);
});

world.afterEvents.itemUse.subscribe((event) => {
    const player = event.source;
    if (!player || !player.isValid || !event.itemStack) return;
    runEventHandlers('ItemUse', HANDLERS.afterItemUse, event);
});

world.afterEvents.entityDie.subscribe((event) => {
    const deadEntity = event.deadEntity;
    if (!deadEntity || !deadEntity.isValid) return;

    const typeHandlers = HANDLERS.afterEntityDieByType.get(deadEntity.typeId);
    if (typeHandlers && typeHandlers.length > 0) {
        runEventHandlers('EntityDieByType', typeHandlers, event);
    }

    if (deadEntity.typeId === 'minecraft:player') {
        runEventHandlers('EntityDie(Player)', HANDLERS.afterEntityDiePlayer, event);
    }
});

world.afterEvents.playerSpawn.subscribe((event) => {
    const player = event.player;
    if (!player || !player.isValid) return;

    Registry.add(player);
    
    if (event.initialSpawn) {
        runEventHandlers('PlayerJoin', HANDLERS.afterPlayerJoin, event);
    }
    runEventHandlers('PlayerSpawn', HANDLERS.afterPlayerSpawn, event);
});

world.beforeEvents.playerLeave.subscribe((event) => {
    runEventHandlers('PlayerLeave(Before)', HANDLERS.beforePlayerLeave, event);
    Registry.remove(event.player.id);
});

world.afterEvents.playerLeave.subscribe((event) => {
    runEventHandlers('PlayerLeave(After)', HANDLERS.afterPlayerLeave, event.playerId);
});

world.beforeEvents.entityHurt.subscribe((event) => {
    const hurtEntity = event.hurtEntity;
    if (!hurtEntity || !hurtEntity.isValid) return;
    runEventHandlers('EntityHurt', HANDLERS.beforeEntityHurt, event);
});

world.afterEvents.entitySpawn.subscribe((event) => {
    const entity = event.entity;
    if (!entity || !entity.isValid) return;

    const handlers = HANDLERS.afterEntitySpawnByType.get(entity.typeId);
    if (handlers && handlers.length > 0) {
        runEventHandlers('EntitySpawn', handlers, event);
    }
});

world.beforeEvents.explosion.subscribe((event) => {
    runEventHandlers('Explosion', HANDLERS.beforeExplosion, event);
});

world.beforeEvents.playerBreakBlock.subscribe((event) => {
    const player = event.player;
    if (!player || !player.isValid || !event.block) return;
    runEventHandlersWithCancel('PlayerBreakBlock(Before)', HANDLERS.beforePlayerBreakBlock, event);
});

world.afterEvents.playerBreakBlock.subscribe((event) => {
    const player = event.player;
    if (!player || !player.isValid || !event.block) return;
    runEventHandlersWithCancel('PlayerBreakBlock(After)', HANDLERS.afterPlayerBreakBlock, event);
});

world.afterEvents.playerDimensionChange.subscribe((event) => {
    const player = event.player;
    if (!player || !player.isValid) return;
    runEventHandlers('PlayerDimensionChange', HANDLERS.afterPlayerDimensionChange, event);
});

world.beforeEvents.playerInteractWithBlock.subscribe((event) => {
    const player = event.player;
    if (!player || !player.isValid) return;
    runEventHandlersWithCancel('PlayerInteractWithBlock(Before)', HANDLERS.beforePlayerInteractBlock, event);
});

world.afterEvents.playerInteractWithBlock.subscribe((event) => {
    const player = event.player;
    if (!player || !player.isValid) return;
    runEventHandlers('PlayerInteractWithBlock(After)', HANDLERS.afterPlayerInteractBlock, event);
});

world.beforeEvents.playerInteractWithEntity.subscribe((event) => {
    const player = event.player;
    const target = event.target;
    if (!player || !player.isValid || !target) return;
    runEventHandlersWithCancel('PlayerInteractWithEntity', HANDLERS.beforePlayerInteractEntity, event);
});

world.beforeEvents.playerPlaceBlock.subscribe((event) => {
    const player = event.player;
    const block = event.block;
    if (!player || !player.isValid || !block) return;
    runEventHandlersWithCancel('PlayerPlaceBlock', HANDLERS.beforePlayerPlaceBlock, event);
});
