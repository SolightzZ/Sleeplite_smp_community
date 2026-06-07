import { ItemStack } from '@minecraft/server';
import { CONFIG } from '../config.js';

export const coordinateKey = (x, y, z) => `${Math.floor(x)}_${Math.floor(y)}_${Math.floor(z)}`;

export const isWithinRange = (x, z) => {
    const dist = Math.sqrt(x * x + z * z);

    return dist <= CONFIG.maxDistance;
};

export const isContainer = (blockId) => CONFIG.allowedContainers.includes(blockId);

export const isShopTool = (itemStack) => {
    if (!itemStack) return false;

    return itemStack.typeId === CONFIG.shopTool;
};

export const generateShopId = (playerName, shopCount) => {
    const cleanedName = playerName.toLowerCase().replace(/\s+/g, '');

    const paddedNumber = String(shopCount).padStart(4, '0');

    return `shop-${cleanedName}-${paddedNumber}`;
};

export const currentTimestamp = () => Math.floor(Date.now() / 1000);

export const isFormValid = (player, response) => {
    if (response.canceled) return false;

    if ('formValues' in response && (!response.formValues || !Array.isArray(response.formValues))) {
        player.sendMessage(`§c[Shop] ฟอร์มไม่ถูกต้อง กรุณาลองใหม่`);

        return false;
    }
    return true;
};

export const formatName = (itemId) => {
    const name = itemId.replace('minecraft:', '');

    return name
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

export const addCurrency = (container, amount) => {
    try {
        let remaining = amount;

        const size = container.size;

        for (const slot of Array.from({ length: size }).keys()) {
            if (remaining <= 0) break;

            const item = container.getItem(slot);

            if (!item) {
                container.setItem(slot, new ItemStack(CONFIG.currencyId, Math.min(remaining, 64)));

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
        console.error('[Shop] addCurrency:', error);
        return amount;
    }
};

export const formatThaiTime = (unixTimestamp) => {
    if (!unixTimestamp || unixTimestamp === 0) return '§7-';

    //แปลงเวลา - แปลง Unix Timestamp เป็นเวลาไทย (UTC+7)
    const date = new Date((unixTimestamp + 7 * 60 * 60) * 1000);

    const day = String(date.getUTCDate()).padStart(2, '0');

    const month = String(date.getUTCMonth() + 1).padStart(2, '0');

    const year = date.getUTCFullYear();

    const hours = String(date.getUTCHours()).padStart(2, '0');

    const minutes = String(date.getUTCMinutes()).padStart(2, '0');

    const seconds = String(date.getUTCSeconds()).padStart(2, '0');

    return `§e${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};

export const transferItemToInventory = (container, itemStack) => {
    const totalAmount = itemStack.amount;

    const remain = container.addItem(itemStack);

    const returned = totalAmount - (remain ? remain.amount : 0);

    return {
        returned,

        lost: remain ? remain.amount : 0,

        remainder: remain ?? null,
    };
};
