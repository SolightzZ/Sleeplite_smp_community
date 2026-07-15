import { world } from '@minecraft/server';
import { pcheck } from './../shared/player.js';
import { logError, logWarn } from './logger.js';
import { Registry } from './registry.js';
import { runEventHandlers, runEventHandlersWithCancel } from './utils.js';

const subscribe = (signal, label, handler) => {
   signal.subscribe((event) => {
      try {
         handler(event);
      } catch (error) {
         logError('Router', `${label} error`, error);
      }
   });
};

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
   afterPlayerInventoryChange: [],
   beforePlayerInteractEntity: [],
   beforePlayerPlaceBlock: [],
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
         logWarn('Router', `Unknown event type registered: ${event}`);
      }
   },
};

subscribe(world.afterEvents.worldLoad, 'worldLoad', () => {
   Registry.init();
});

subscribe(world.beforeEvents.chatSend, 'chatSend', (event) => {
   const sender = event.sender;
   if (!pcheck(sender)) return;
   runEventHandlersWithCancel('ChatSend', HANDLERS.beforeChatSend, event);
});

subscribe(world.afterEvents.itemUse, 'itemUse', (event) => {
   const player = event.source;
   if (!pcheck(player) || !event.itemStack) return;
   runEventHandlers('ItemUse', HANDLERS.afterItemUse, event);
});

subscribe(world.afterEvents.entityDie, 'entityDie', (event) => {
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

subscribe(world.afterEvents.playerSpawn, 'playerSpawn', (event) => {
   const player = event.player;
   if (!pcheck(player)) return;

   Registry.add(player);

   if (event.initialSpawn) {
      runEventHandlers('PlayerJoin', HANDLERS.afterPlayerJoin, event);
   }
   runEventHandlers('PlayerSpawn', HANDLERS.afterPlayerSpawn, event);
});

subscribe(world.beforeEvents.playerLeave, 'playerLeave', (event) => {
   runEventHandlers('PlayerLeave(Before)', HANDLERS.beforePlayerLeave, event);
   Registry.remove(event.player.id);
});

subscribe(world.afterEvents.playerLeave, 'playerLeave(After)', (event) => {
   runEventHandlers('PlayerLeave(After)', HANDLERS.afterPlayerLeave, event.playerId);
});

subscribe(world.beforeEvents.entityHurt, 'entityHurt', (event) => {
   const hurtEntity = event.hurtEntity;
   if (!hurtEntity || !hurtEntity.isValid) return;
   runEventHandlers('EntityHurt', HANDLERS.beforeEntityHurt, event);
});

subscribe(world.afterEvents.entitySpawn, 'entitySpawn', (event) => {
   const entity = event.entity;
   if (!entity || !entity.isValid) return;

   const handlers = HANDLERS.afterEntitySpawnByType.get(entity.typeId);
   if (handlers && handlers.length > 0) {
      runEventHandlers('EntitySpawn', handlers, event);
   }
});

subscribe(world.beforeEvents.explosion, 'explosion', (event) => {
   runEventHandlers('Explosion', HANDLERS.beforeExplosion, event);
});

subscribe(world.beforeEvents.playerBreakBlock, 'playerBreakBlock', (event) => {
   const player = event.player;
   if (!pcheck(player) || !event.block) return;
   runEventHandlersWithCancel('PlayerBreakBlock(Before)', HANDLERS.beforePlayerBreakBlock, event);
});

subscribe(world.afterEvents.playerBreakBlock, 'playerBreakBlock(After)', (event) => {
   const player = event.player;
   if (!pcheck(player) || !event.block) return;
   runEventHandlersWithCancel('PlayerBreakBlock(After)', HANDLERS.afterPlayerBreakBlock, event);
});

subscribe(world.afterEvents.playerDimensionChange, 'playerDimensionChange', (event) => {
   const player = event.player;
   if (!pcheck(player)) return;
   runEventHandlers('PlayerDimensionChange', HANDLERS.afterPlayerDimensionChange, event);
});

subscribe(world.beforeEvents.playerInteractWithBlock, 'playerInteractWithBlock', (event) => {
   const player = event.player;
   if (!pcheck(player)) return;
   runEventHandlersWithCancel('PlayerInteractWithBlock(Before)', HANDLERS.beforePlayerInteractBlock, event);
});

subscribe(world.afterEvents.playerInteractWithBlock, 'playerInteractWithBlock(After)', (event) => {
   const player = event.player;
   if (!pcheck(player)) return;
   runEventHandlers('PlayerInteractWithBlock(After)', HANDLERS.afterPlayerInteractBlock, event);
});

subscribe(world.afterEvents.playerInventoryItemChange, 'playerInventoryItemChange', (event) => {
   const player = event.player;
   if (!pcheck(player)) return;
   runEventHandlers('PlayerInventoryItemChange', HANDLERS.afterPlayerInventoryChange, event);
});

subscribe(world.beforeEvents.playerInteractWithEntity, 'playerInteractWithEntity', (event) => {
   const player = event.player;
   const target = event.target;
   if (!pcheck(player) || !target) return;
   runEventHandlersWithCancel('PlayerInteractWithEntity', HANDLERS.beforePlayerInteractEntity, event);
});

subscribe(world.beforeEvents.playerPlaceBlock, 'playerPlaceBlock', (event) => {
   const player = event.player;
   const block = event.block;
   if (!pcheck(player) || !block) return;
   runEventHandlersWithCancel('PlayerPlaceBlock', HANDLERS.beforePlayerPlaceBlock, event);
});
