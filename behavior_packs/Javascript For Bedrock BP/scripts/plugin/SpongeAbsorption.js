const SPONGE = 'minecraft:sponge';
const WATER = 'minecraft:water';
const MAX_DISTANCE = 6;

const findSpongeSlot = (container) => {
    const size = container.size;

    for (let i = 0; i < size; i++) {
        const item = container.getItem(i);
        if (item && item.typeId === SPONGE) return i;
    }

    return -1;
};

const getSpongeSlot = (player, container) => {
    const selectedSlot = player.selectedSlotIndex;

    if (selectedSlot >= 0 && selectedSlot < container.size) {
        const selectedItem = container.getItem(selectedSlot);

        if (selectedItem && selectedItem.typeId === SPONGE) return selectedSlot;
    }

    return findSpongeSlot(container);
};

const getTargetWaterBlock = (player) => {
    const hit = player.getBlockFromViewDirection({
        maxDistance: MAX_DISTANCE,
        includeLiquidBlocks: true,
        includePassableBlocks: true,
    });

    if (!hit || !hit.block || !hit.block.isValid) return undefined;
    if (hit.block.typeId !== WATER) return undefined;
    return hit.block;
};

const consumeSponge = (container, slot) => {
    const item = container.getItem(slot);
    if (!item || item.typeId !== SPONGE) return false;
    if (item.amount > 1) {
        item.amount--;
        container.setItem(slot, item);
        return true;
    }

    container.setItem(slot, undefined);
    return true;
};

const absorbWaterWithSponge = (container, slot, block) => {
    if (!consumeSponge(container, slot)) return;
    block.setType(SPONGE);
};

export const handleSpongeAbsorption = (event) => {
    try {
        const item = event.itemStack;
        if (!item || item.typeId !== SPONGE) return;

        const player = event.source;
        if (!player || !player.isValid) return;

        const container = player.getComponent('minecraft:inventory')?.container;
        if (!container) return;

        const slot = getSpongeSlot(player, container);
        if (slot === -1) return;

        const waterBlock = getTargetWaterBlock(player);
        if (!waterBlock) return;

        if (!player.isValid || !waterBlock.isValid) return;
        absorbWaterWithSponge(container, slot, waterBlock);
    } catch (error) {
        console.error('[ SpongeAbsorption ] handleSpongeAbsorption', error.message);
    }
};
