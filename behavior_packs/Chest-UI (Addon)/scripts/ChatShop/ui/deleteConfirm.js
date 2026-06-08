import { getContainer, deleteShop, spawnItemStack } from '../utils/blockUtils.js';
import { formatName, transferItemToInventory } from '../utils/helpers.js';
import shopDatabase from '../data/database.js';

export function clearAndDelete(player, shop) {
    try {
        const inventory = player.getComponent('minecraft:inventory')?.container;

        const container = getContainer(shop);

        if (container && inventory) {
            const returned = [];
            const dropped = [];

            Array.from({ length: container.size }).forEach((_, i) => {
                const item = container.getItem(i);
                if (!item) return;

                const itemStack = container.getItem(i);

                container.setItem(i, undefined);

                const { returned: returnedCount, lost: lostCount, remainder } = transferItemToInventory(inventory, itemStack);

                if (returnedCount > 0) {
                    returned.push({
                        name: formatName(itemStack.typeId),
                        count: returnedCount,
                    });
                }

                if (lostCount > 0 && remainder) {
                    spawnItemStack(shop, remainder);
                    dropped.push({
                        name: formatName(itemStack.typeId),
                        count: lostCount,
                    });
                }
            });

            if (returned.length > 0) {
                const summary = returned.map((r) => `${r.name} x${r.count}`).join(', ');
                player.sendMessage(`§a[Shop] คืนสินค้า: ${summary}`);
            }
            if (dropped.length > 0) {
                const summary = dropped.map((r) => `${r.name} x${r.count}`).join(', ');
                player.sendMessage(`§e[Shop] สินค้าส่วนถูกวางบนพื้น: ${summary}`);
            }
        }

        deleteShop(shop.shopId);

        if (shopDatabase.data.shops[shop.shopId]) {
            console.error(`[Shop] clearAndDelete: shop ${shop.shopId} still exists after deleteShop call`);
            if (player?.isValid) {
                player.sendMessage(`§c[Shop] ไม่สามารถลบร้านค้าได้ กรุณาลองอีกครั้ง`);
            }
            return false;
        }

        player.sendMessage(`§e[Shop] ลบร้านค้าเรียบร้อย เก็บประวัติการซื้อขายไว้ในระบบ`);
        return true;
    } catch (error) {
        console.error('[Shop] clearAndDelete:', error);
        if (player?.isValid) {
            player.sendMessage(`§c[Shop] เกิดข้อผิดพลาดในการลบร้านค้า`);
        }
        return false;
    }
}

export function validateDeleteInput(inputShopId, inputOwnerName, sliderValue, expectedShopId, expectedOwnerName) {
    const errors = [];

    if (inputShopId !== expectedShopId) {
        errors.push(`§cรหัสร้านค้าไม่ถูกต้อง (ใส่: "${inputShopId}", ที่ถูกต้อง: "${expectedShopId}")`);
    }

    if (inputOwnerName !== expectedOwnerName) {
        errors.push(`§cชื่อเจ้าของร้านไม่ถูกต้อง (ใส่: "${inputOwnerName}", ที่ถูกต้อง: "${expectedOwnerName}")`);
    }

    if (sliderValue < 100) {
        errors.push(`§cกรุณาเลื่อนสไลด์ไปที่ 100 (ปัจจุบัน: ${sliderValue})`);
    }

    return errors;
}
