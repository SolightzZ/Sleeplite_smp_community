import blockUtils from '../utils/blockUtils.js';
import helpers from '../utils/helpers.js';
import uiUtils from '../utils/ui.js';

export function confirmDelete(player, shop) {
    try {
        const container = blockUtils.getContainer(shop);
        const itemCount = container ? countChestItems(container) : 0;

        uiUtils.showMessage(
            player,
            {
                title: 'ลบร้าน',
                body:
                    `คุณแน่ใจที่จะลบร้านนี้?\n` +
                    `สินค้าในร้าน ${itemCount} รายการจะถูกวางบนพื้น\n` +
                    `ประวัติการซื้อขายจะถูกเก็บไว้ในระบบ`,
                btn1: 'ยืนยัน',
                btn2: 'ยกเลิก',
                source: 'shop.delete.confirm',
            },
            (res) => {
                if (res.canceled || res.selection !== 0) return;

                const inv = player.getComponent('minecraft:inventory')?.container;

                const container = blockUtils.getContainer(shop);
                if (container && inv) {
                    const returned = [];
                    const dropped = [];

                    Array.from({ length: container.size }).forEach((_, i) => {
                        const item = container.getItem(i);
                        if (!item) return;

                        const itemStack = container.getItem(i);
                        container.setItem(i, undefined);

                        const {
                            returned: returnedCount,
                            lost: lostCount,
                            remainder,
                        } = helpers.addItemStack(inv, itemStack);

                        if (returnedCount > 0) {
                            returned.push({
                                name: helpers.formatName(itemStack.typeId),
                                count: returnedCount,
                            });
                        }
                        if (lostCount > 0 && remainder) {
                            blockUtils.spawnItemStack(shop, remainder);
                            dropped.push({
                                name: helpers.formatName(itemStack.typeId),
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

                blockUtils.deleteShop(shop.shopId);

                player.sendMessage(`§e[Shop] ลบร้านค้าเรียบร้อย เก็บประวัติการซื้อขายไว้ในระบบ`);
            },
        );
    } catch (error) {
        console.error('[Shop] confirmDelete:', error);
    }
}

function countChestItems(container) {
    if (!container) return 0;
    return Array.from({ length: container.size }).filter((_, i) => container.getItem(i)).length;
}
