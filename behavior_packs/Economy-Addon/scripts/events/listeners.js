import { system, world } from '@minecraft/server';
import { onAdminCommand, onCommand } from '../command.js';
import { CONFIG } from '../config.js';
import { isOwner, isProtectedShopChest } from '../core/protection.js';
import { removeSnapshot } from '../core/state.js';
import { startBuy } from '../form/buyLogic.js';
import { pcheck } from '../shared/cache.js';

system.beforeEvents.startup.subscribe((init) => {
   onCommand(init);
   onAdminCommand(init);
});

world.beforeEvents.explosion.subscribe((ev) => {
   const blocks = ev.impactedBlocks ?? [];
   const filtered = blocks.filter((b) => {
      if (b.typeId !== CONFIG.CHEST_ID) return true;
      return !isProtectedShopChest(b);
   });
   if (filtered.length !== blocks.length) {
      ev.impactedBlocks = filtered;
   }
});

world.beforeEvents.playerBreakBlock.subscribe((ev) => {
   if (ev.block.typeId !== CONFIG.CHEST_ID) return;

   try {
      const result = isProtectedShopChest(ev.block);
      if (!result) return;

      ev.cancel = true;
   } catch (error) {
      logError('BreakProtect', 'Error in break protection', error);
   }
});

world.beforeEvents.playerInteractWithBlock.subscribe((ev) => {
   if (ev.block.typeId !== CONFIG.CHEST_ID) return;

   try {
      const result = isProtectedShopChest(ev.block);
      if (!result) return;
      if (isOwner(ev.player.name, result.record)) return;
      ev.cancel = true;
      const player = ev.player;
      const chestKey = result.key;

      system.run(() => {
         if (!pcheck(player)) return;
         startBuy(player, chestKey);
      });
   } catch (error) {
      logError('InteractShop', 'Error in shop interaction', error);
   }
});

// กัน ghost snapshot ค้างเมื่อผู้เล่นออก
world.afterEvents.playerLeave.subscribe((ev) => {
   removeSnapshot(ev.playerId);
});
