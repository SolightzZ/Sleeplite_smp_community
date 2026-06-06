import { CONFIG } from '../config.js';
import shopDatabase from './database.js';
import shopQueries from './shopQueries.js';
import helpers from '../utils/helpers.js';

class ShopCreator {
    createShop = (player, block) => {
        try {
            const data = shopDatabase.data;

            if (player.dimension.id !== CONFIG.dim) {
                player.sendMessage(`§c[Shop] ร้านค้าสามารถสร้างได้เฉพาะใน Overworld เท่านั้น`);
                return;
            }

            const { x, z } = block.location;
            if (!helpers.isWithinRange(x, z)) {
                player.sendMessage(`§c[Shop] ร้านค้าต้องอยู่ในระยะ ${CONFIG.maxDistance} blocks จาก 0,0,0`);
                return;
            }

            if (!helpers.isContainer(block.typeId)) {
                player.sendMessage(`§c[Shop] กรุณาใช้กับ Chest หรือ Barrel เท่านั้น`);
                return;
            }

            const playerShops = shopQueries.countPlayerShops(player.id);
            if (playerShops >= CONFIG.maxShopPerPlayer) {
                player.sendMessage(`§c[Shop] คุณสามารถสร้างร้านได้สูงสุด ${CONFIG.maxShopPerPlayer} ร้าน`);
                return;
            }

            const key = helpers.blockKey(x, block.location.y, z);
            if (data.protectedBlocks[key]) {
                player.sendMessage(`§c[Shop] กล่องนี้มีร้านค้าอยู่แล้ว`);
                return;
            }

            const shopId = helpers.genShopId();
            const timestamp = helpers.now();
            const loc = {
                x: Math.floor(x),
                y: Math.floor(block.location.y),
                z: Math.floor(z),
            };

            data.protectedBlocks[key] = {
                shopId,
                ownerId: player.id,
                type: 'shop',
            };

            data.shops[shopId] = {
                shopId,
                owner: {
                    playerId: player.id,
                    playerName: player.name,
                },
                createdAt: timestamp,
                updatedAt: timestamp,
                lastSale: 0,
                dimension: CONFIG.dim,
                location: loc,
                container: {
                    blockId: block.typeId,
                    slots: shopQueries.getContainerSlotCount(block.typeId),
                    containerHash: key,
                    isProtected: true,
                },
                protection: { ...CONFIG.protection },
                status: {
                    isEnabled: true,
                    isLocked: false,
                    pendingRevenue: 0,
                    visitCount: 0,
                    lastAccess: timestamp,
                },
                stats: {
                    totalSales: 0,
                    totalRevenue: 0,
                    uniqueBuyers: 0,
                    repeatBuyers: 0,
                },
                buyers: {},
                prices: {},
                salesHistory: {},
            };

            shopDatabase.save();
            player.sendMessage(`§a[Shop] สร้างร้านค้าสำเร็จ!`);
        } catch (error) {
            console.error('[Shop] createShop:', error);
        }
    };
}

export default new ShopCreator();
