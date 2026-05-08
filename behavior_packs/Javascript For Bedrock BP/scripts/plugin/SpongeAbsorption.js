import { system } from "@minecraft/server";

const findSpongeSlot = (inv) => {
  for (let i = 0; i < inv.size; i++) {
    const it = inv.getItem(i);
    if (it && it.typeId === "minecraft:sponge") return i;
  }
  return -1;
};

const consumeAndPlaceSponge = (player, inv, slot, targetBlock) => {
  system.run(() => {
    targetBlock.setType("minecraft:sponge");

    const it = inv.getItem(slot);
    if (!it) return;

    if (it.amount > 1) {
      it.amount--;
      inv.setItem(slot, it);
    } else {
      inv.setItem(slot, undefined);
    }
  });
};

function handleSpongeAbsorption(event) {
  try {
    const item = event.itemStack;
    if (!item || item.typeId !== "minecraft:sponge") return;

    const player = event.source;
    const inv = player.getComponent("inventory")?.container;
    if (!inv) return;

    const slot = findSpongeSlot(inv);
    if (slot === -1) return;

    const head = player.getHeadLocation();
    const view = player.getViewDirection();

    const target = {
      x: (head.x + view.x * 5) | 0,
      y: (head.y + view.y * 5) | 0,
      z: (head.z + view.z * 5) | 0,
    };

    const block = player.dimension.getBlock(target);
    if (!block || block.typeId !== "minecraft:water") return;
    consumeAndPlaceSponge(player, inv, slot, block);
  } catch (error) {
    console.error("handleSpongeAbsorption:: " + error);
  }
}

export { handleSpongeAbsorption };

