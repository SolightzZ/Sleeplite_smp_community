import { system } from '@minecraft/server';
import { CONFIG } from '../config.js';
import shopDatabase from '../data/database.js';
import { showBuyMenu } from '../ui/buyMenu.js';
import { manageItems } from '../ui/manageItems.js';
import { deleteShop } from '../utils/blockUtils.js';
import { coordinateKey, currentTimestamp, isContainer, isShopTool } from '../utils/helpers.js';
import { createShop } from './shopCreator.js';
import { findShopByBlock } from './shopQueries.js';
import { isAdmin, showAdminInteract } from '../admin/adminPanel.js';

export function onShopInteract(event) {
    try {
        const player = event.player;
        const block = event.block;
        if (!player?.isValid() || !block) return;

        if (!isContainer(block.typeId)) return;

        const shop = findShopByBlock(block);

        if (!shop) {
            const heldItem = player.getComponent('minecraft:inventory')?.container?.getItem(player.selectedSlotIndex);
            if (!heldItem || !isShopTool(heldItem)) return;

            event.cancel = true;
            createShop(player, block);
            return;
        }

        event.cancel = true;
        shop.status.lastAccess = currentTimestamp();
        shop.status.visitCount = (shop.status.visitCount || 0) + 1;

        const expectedKey = coordinateKey(block.location.x, block.location.y, block.location.z);
        const registeredKey = coordinateKey(shop.location.x, shop.location.y, shop.location.z);
        if (registeredKey !== expectedKey) {
            player.sendMessage(`§c[Shop] ตรวจพบว่ากล่องถูกย้าย กรุณาลบร้านและสร้างใหม่`);
            shopDatabase.save();
            return;
        }

        shopDatabase.save();

        if (shop.owner.playerId === player.id) {
            system.run(() => {
                if (player.isValid()) manageItems(player, shop);
            });
        } else if (isAdmin(player)) {
            system.run(() => {
                if (player.isValid()) showAdminInteract(player, shop);
            });
        } else {
            if (!shop.status.isEnabled) {
                player.sendMessage(`§c[Shop] ร้านนี้ถูกปิดใช้งานชั่วคราว`);
                return;
            }
            if (shop.status.isLocked) {
                player.sendMessage(`§c[Shop] ร้านนี้ถูกล็อคชั่วคราว`);
                return;
            }
            system.run(() => {
                if (player.isValid()) showBuyMenu(player, shop);
            });
        }
    } catch (error) {
        console.error('[Shop] onShopInteract:', error);
    }
}

export function onShopBreak(event) {
    try {
        const player = event.player;
        const block = event.block;
        if (!player?.isValid() || !block) return;

        const data = shopDatabase.data;

        if (block.typeId === CONFIG.baseBlock) {
            const aboveKey = coordinateKey(block.location.x, block.location.y + 1, block.location.z);
            if (data.protectedBlocks[aboveKey]) {
                event.cancel = true;
                player.sendMessage(`§c[Shop] ไม่สามารถทำลายฐานร้านค้าได้`);
                return;
            }
        }

        const blockKey = coordinateKey(block.location.x, block.location.y, block.location.z);
        const protectedEntry = data.protectedBlocks[blockKey];
        if (!protectedEntry) return;

        const shopId = typeof protectedEntry === 'object' ? protectedEntry.shopId : protectedEntry;
        const shop = data.shops[shopId];
        if (!shop) return;

        if (shop.owner.playerId === player.id) {
            if (shop.protection.allowOwnerBreak) {
                system.run(() => {
                    deleteShop(shop.shopId);
                });
                player.sendMessage(`§e[Shop] ร้านค้าถูกลบแล้ว`);
                return;
            }
        }

        event.cancel = true;
        player.sendMessage(`§c[Shop] ร้านค้าถูกป้องกัน`);
    } catch (error) {
        console.error('[Shop] onShopBreak:', error);
    }
}

export function onShopExplosion(event) {
    try {
        const data = shopDatabase.data;
        if (!event.dimension || !data?.protectedBlocks) return;

        const protectedCount = Object.keys(data.protectedBlocks).length;
        if (protectedCount === 0) return;

        const impactedBlocks = event.getImpactedBlocks();
        const hasProtected = impactedBlocks.some((block) => {
            if (!block?.location) return false;

            const blockKey = coordinateKey(block.location.x, block.location.y, block.location.z);
            return !!data.protectedBlocks[blockKey];
        });
        if (hasProtected) {
            event.cancel = true;
        }
    } catch (error) {
        console.error('[Shop] onShopExplosion:', error);
    }
}
