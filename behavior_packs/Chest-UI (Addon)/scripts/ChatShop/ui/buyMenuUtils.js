export function getAvailableItems(container, prices) {
    return Array.from({ length: container.size })

        .map((_, slotIndex) => {
            const item = container.getItem(slotIndex);

            if (!item) return null;

            const slotKey = String(slotIndex);

            const price = prices[slotKey];

            if (price === undefined || price === null) return null;

            return {
                slotKey,
                slotIndex,
                itemId: item.typeId,
                amount: item.amount,
                price,
            };
        })
        .filter(Boolean);
}

export function getValidAmounts(maxAmount) {
    const presetAmounts = [1, 2, 4, 8, 16, 32, 64];

    const validAmounts = presetAmounts.filter((a) => a <= maxAmount);

    validAmounts.push(maxAmount);

    return validAmounts;
}

export function calculateTotalPrice(price, buyAmount, maxAmount) {
    return Math.ceil((price * buyAmount) / maxAmount);
}
