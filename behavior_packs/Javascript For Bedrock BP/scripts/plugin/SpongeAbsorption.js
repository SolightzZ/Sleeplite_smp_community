import { system } from "@minecraft/server";

const SPONGE = "minecraft:sponge";
const WATER = "minecraft:water";

const findSpongeSlot = (inv) => {
  const size = inv.size;
  for (let i = 0; i < size; i++) {
    const it = inv.getItem(i);
    if (it && it.typeId === SPONGE) return i;
  }
  return -1;
};

const placeSponge = (player, inv, slot, block) => {
  system.run(() => {
    block.setType(SPONGE);

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

export const handleSpongeAbsorption = (ev) => {
  try {
    const item = ev.itemStack;
    if (!item || item.typeId !== SPONGE) return;

    const player = ev.source;
    if (!player || !player.isValid) return;

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
    if (!block || block.typeId !== WATER) return;

    placeSponge(player, inv, slot, block);
  } catch (e) {
    console.error("handleSpongeAbsorption", e.message);
  }
};
