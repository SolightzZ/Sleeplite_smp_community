import { world } from '@minecraft/server';
import { CONFIG } from '../config.js';
import shopDatabase from '../data/database.js';
import { coordinateKey, currentTimestamp, generateShopId, isContainer, isWithinRange } from '../utils/helpers.js';
import { countPlayerShops } from './shopQueries.js';

export function createShop(player, block) {
    try {
        const data = shopDatabase.data;

        if (player.dimension.id !== CONFIG.dimension) {
            player.sendMessage(`§c[Shop] ร้านค้าสามารถสร้างได้เฉพาะใน Overworld เท่านั้น`);
            return;
        }

        const { x, z } = block.location;
        if (!isWithinRange(x, z)) {
            player.sendMessage(`§c[Shop] ร้านค้าต้องอยู่ในระยะ ${CONFIG.maxDistance} blocks จาก 0,0,0`);
            return;
        }

        if (!isContainer(block.typeId)) {
            player.sendMessage(`§c[Shop] กรุณาใช้กับ Chest เท่านั้น`);
            return;
        }

        const playerShops = countPlayerShops(player.id);
        if (playerShops >= CONFIG.maxShopsPerPlayer) {
            player.sendMessage(`§c[Shop] คุณสามารถสร้างร้านได้สูงสุด ${CONFIG.maxShopsPerPlayer} ร้าน`);
            return;
        }

        const blockKey = coordinateKey(x, block.location.y, z);
        if (data.protectedBlocks[blockKey]) {
            player.sendMessage(`§c[Shop] กล่องนี้มีร้านค้าอยู่แล้ว`);
            return;
        }

        const baseBlockY = Math.floor(block.location.y) - 1;
        const dimension = world.getDimension(CONFIG.dimension);
        if (!dimension) {
            player.sendMessage(`§c[Shop] ไม่สามารถเข้าถึง dimension ได้`);
            return;
        }
        const baseBlock = dimension.getBlock({
            x: Math.floor(x),
            y: baseBlockY,
            z: Math.floor(z),
        });
        if (!baseBlock || baseBlock.typeId !== CONFIG.baseBlock) {
            player.sendMessage(`§c[Shop] ต้องมี Emerald Block อยู่ใต้ Chest`);
            return;
        }

        //นับร้าน - นับร้านทั้งหมด (active+deleted) +1 สำหรับร้านใหม่
        const totalPlayerShops = countPlayerShops(player.id) + Object.values(data.deletedShops || {}).filter((s) => s.owner?.playerId === player.id).length + 1;
        const shopId = generateShopId(player.name, totalPlayerShops);
        const creationTimestamp = currentTimestamp();
        const shopLocation = {
            x: Math.floor(x),
            y: Math.floor(block.location.y),
            z: Math.floor(z),
        };

        data.protectedBlocks[blockKey] = shopId;

        data.shops[shopId] = {
            shopId,
            owner: {
                playerId: player.id,
                playerName: player.name,
            },
            createdAt: creationTimestamp,
            updatedAt: creationTimestamp,
            lastSale: 0,
            dimension: CONFIG.dimension,
            location: shopLocation,
            container: {
                blockId: block.typeId,
                isProtected: true,
            },
            baseBlock: {
                x: Math.floor(x),
                y: baseBlockY,
                z: Math.floor(z),
            },
            protection: { ...CONFIG.protection },
            status: {
                isEnabled: true,
                isLocked: false,
                pendingRevenue: 0,
                visitCount: 0,
                lastAccess: creationTimestamp,
            },
            buyers: {},
            prices: {},
            salesHistory: [],
        };

        shopDatabase.save();
        player.sendMessage(`§a[Shop] สร้างร้านค้าสำเร็จ!`);
    } catch (error) {
        console.error('[Shop] createShop:', error);
    }
}
