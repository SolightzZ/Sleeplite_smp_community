import { ItemStack } from '@minecraft/server';
import { CONFIG } from '../config.js';

class Helpers {
    blockKey = (x, y, z) => `${Math.floor(x)}_${Math.floor(y)}_${Math.floor(z)}`;

    isWithinRange = (x, z) => {
        const dist = Math.sqrt(x * x + z * z);
        return dist <= CONFIG.maxDistance;
    };

    getDistance = (x, z) => Math.floor(Math.sqrt(x * x + z * z));

    isContainer = (blockId) => CONFIG.allowedContainers.includes(blockId);

    isShopTool = (itemStack) => {
        if (!itemStack) return false;
        return itemStack.typeId === CONFIG.shopTool;
    };

    genShopId = () => {
        const ts = Date.now();
        const rand = Math.random().toString(36).substring(2, 10);
        return `shop_${ts}_${rand}`;
    };

    now = () => Math.floor(Date.now() / 1000);

    isFormValid = (player, response) => {
        if (response.canceled) return false;
        if (
            'formValues' in response &&
            (!response.formValues || !Array.isArray(response.formValues))
        ) {
            player.sendMessage(`§c[Shop] ฟอร์มไม่ถูกต้อง กรุณาลองใหม่`);
            return false;
        }
        return true;
    };

    formatName = (itemId) => {
        const name = itemId.replace('minecraft:', '');
        return name
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    addDiamonds = (container, amount) => {
        try {
            let remaining = amount;
            const size = container.size;

            for (const slot of Array.from({ length: size }).keys()) {
                if (remaining <= 0) break;
                const item = container.getItem(slot);
                if (!item) {
                    container.setItem(
                        slot,
                        new ItemStack(CONFIG.currencyId, Math.min(remaining, 64)),
                    );
                    remaining -= Math.min(remaining, 64);
                } else if (item.typeId === CONFIG.currencyId && item.amount < 64) {
                    const space = 64 - item.amount;
                    const add = Math.min(space, remaining);
                    item.amount += add;
                    container.setItem(slot, item);
                    remaining -= add;
                }
            }

            return remaining;
        } catch (error) {
            console.error('[Shop] addDiamonds:', error);
            return amount;
        }
    };

    addItems = (container, itemId, count) => {
        const BATCH_SIZE = 64;
        let remaining = count;

        while (remaining > 0) {
            const batchSize = Math.min(remaining, BATCH_SIZE);
            const remain = container.addItem(new ItemStack(itemId, batchSize));
            const batchReturned = batchSize - (remain ? remain.amount : 0);
            remaining -= batchReturned;
            if (batchReturned <= 0) break;
        }

        return {
            returned: count - remaining,
            lost: remaining,
        };
    };

    addItemStack = (container, itemStack) => {
        const totalAmount = itemStack.amount;
        const remain = container.addItem(itemStack);
        const returned = totalAmount - (remain ? remain.amount : 0);
        return {
            returned,
            lost: remain ? remain.amount : 0,
            remainder: remain ?? null,
        };
    };
}

export default new Helpers();
