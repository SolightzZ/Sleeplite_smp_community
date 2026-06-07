import { world } from '@minecraft/server';

export function depositItems(player, inventory, inventorySlot, container, emptySlot, amount, shop, price) {
    const primaryStack = inventory.getItem(inventorySlot);

    if (!primaryStack) return false;

    const MAX = primaryStack.maxAmount || 64;

    const target = Math.min(amount, MAX);

    let collected = 0;

    for (let i = 0; i < inventory.size; i++) {
        if (i === inventorySlot) continue;
        if (collected >= target) break;

        const stack = inventory.getItem(i);

        if (!stack || stack.typeId !== primaryStack.typeId) continue;

        const needed = target - collected;

        const take = Math.min(needed, stack.amount);

        collected += take;

        if (take >= stack.amount) {
            inventory.setItem(i, undefined);
        } else {
            stack.amount -= take;
            inventory.setItem(i, stack);
        }
    }

    const need = target - collected;

    const takeFromPrimary = Math.min(need, primaryStack.amount);

    if (takeFromPrimary === 0 && collected === 0) return false;

    let remaining = primaryStack.amount - takeFromPrimary;

    const totalCollected = collected + takeFromPrimary;

    inventory.setItem(inventorySlot, undefined);

    let leftToDistribute = totalCollected;

    for (let i = 0; i < container.size; i++) {
        if (leftToDistribute <= 0) break;

        const stack = container.getItem(i);

        if (!stack || stack.typeId !== primaryStack.typeId || stack.amount >= MAX) continue;

        //เติมเฉพาะของ - ชนิดเดียวกันและราคาเดียวกันเท่านั้น
        if (shop.prices[String(i)] !== price) continue;

        const space = MAX - stack.amount;

        const add = Math.min(leftToDistribute, space);

        stack.amount += add;

        container.setItem(i, stack);

        leftToDistribute -= add;
    }

    let usedEmptySlot = false;

    if (leftToDistribute > 0) {
        if (emptySlot !== undefined && emptySlot !== null) {
            primaryStack.amount = leftToDistribute;
            container.setItem(emptySlot, primaryStack);
            usedEmptySlot = true;
            leftToDistribute = 0;
        } else {
            remaining += leftToDistribute;
            leftToDistribute = 0;
        }
    }

    let left = remaining;

    while (left > 0) {
        const chunk = Math.min(left, MAX);

        primaryStack.amount = chunk;

        const remainder = inventory.addItem(primaryStack);

        if (remainder) {
            const dimension = world.getDimension(shop.dimension);

            if (dimension) {
                dimension.spawnItem(remainder, {
                    x: shop.location.x + 0.5,
                    y: shop.location.y + 0.5,
                    z: shop.location.z + 0.5,
                });
            }
            break;
        }
        left -= chunk;
    }

    return usedEmptySlot;
}

export function depositMultipleItems(player, inventory, inventorySlot, container, emptySlots, totalAmount, shop, price) {
    const primaryStack = inventory.getItem(inventorySlot);

    if (!primaryStack) return 0;

    const MAX = primaryStack.maxAmount || 64;
    const itemId = primaryStack.typeId;

    let collected = 0;

    for (let i = 0; i < inventory.size; i++) {
        if (i === inventorySlot) continue;

        if (collected >= totalAmount) break;

        const stack = inventory.getItem(i);

        if (!stack || stack.typeId !== itemId) continue;

        const needed = totalAmount - collected;

        const take = Math.min(needed, stack.amount);

        collected += take;

        if (take >= stack.amount) {
            inventory.setItem(i, undefined);
        } else {
            stack.amount -= take;
            inventory.setItem(i, stack);
        }
    }

    const primaryAmount = primaryStack.amount;

    const need = totalAmount - collected;

    const takeFromPrimary = Math.min(need, primaryAmount);

    const remaining = primaryAmount - takeFromPrimary;

    collected += takeFromPrimary;

    if (collected === 0) return 0;

    if (remaining > 0) {
        primaryStack.amount = remaining;

        inventory.setItem(inventorySlot, primaryStack);
    } else {
        inventory.setItem(inventorySlot, undefined);
    }

    const slotCapacity = [];
    for (let i = 0; i < container.size; i++) {
        const stack = container.getItem(i);

        if (!stack) {
            slotCapacity.push({ slot: i, space: MAX, hasPrice: false });
        } else if (stack.typeId === itemId && shop.prices[String(i)] === price && stack.amount < MAX) {
            slotCapacity.push({
                slot: i,
                space: MAX - stack.amount,
                hasPrice: true,
            });
        }
    }

    slotCapacity.sort((a, b) => {
        if (a.hasPrice !== b.hasPrice) return a.hasPrice ? -1 : 1;
        return a.space - b.space;
    });

    let remainingToDistribute = collected;

    let filled = 0;

    for (const { slot, space, hasPrice } of slotCapacity) {
        if (remainingToDistribute <= 0) break;

        const put = Math.min(remainingToDistribute, space);
        const existing = container.getItem(slot);

        if (existing) {
            existing.amount += put;
            container.setItem(slot, existing);
        } else {
            primaryStack.amount = 1;
            container.setItem(slot, primaryStack);
            container.getSlot(slot).amount = put;
        }

        if (!hasPrice) {
            shop.prices[String(slot)] = price;
        }
        remainingToDistribute -= put;
        filled++;
    }

    if (remainingToDistribute > 0) {
        let left = remainingToDistribute;

        while (left > 0) {
            const chunk = Math.min(left, MAX);
            primaryStack.amount = chunk;
            const r = inventory.addItem(primaryStack);

            if (r) {
                const dimension = world.getDimension(shop.dimension);

                if (dimension) {
                    dimension.spawnItem(r, {
                        x: shop.location.x + 0.5,
                        y: shop.location.y + 0.5,
                        z: shop.location.z + 0.5,
                    });
                }
                break;
            }
            left -= chunk;
        }

        player.sendMessage(`§e[Shop] ใส่ได้ ${collected - remainingToDistribute} ชิ้น (พื้นที่ร้านไม่พอ คืน ${remainingToDistribute} ชิ้น)`);
    }

    return filled;
}
