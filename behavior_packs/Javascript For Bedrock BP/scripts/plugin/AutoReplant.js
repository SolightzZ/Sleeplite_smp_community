import { BlockPermutation } from "@minecraft/server";

const cropMap = {
  "minecraft:wheat": "minecraft:wheat_seeds",
  "minecraft:carrots": "minecraft:carrot",
  "minecraft:potatoes": "minecraft:potato",
  "minecraft:beetroot": "minecraft:beetroot_seeds",
};

const permCache = {};

const getPerm = (id) => {
  try {
    let perm = permCache[id];

    if (!perm) {
      perm = BlockPermutation.resolve(id).withState("growth", 0);
      permCache[id] = perm;
    }
    return perm;
  } catch (error) {
    console.error("getPerm: " + error);
  }
};

const consumeSeed = (container, seedId) => {
  try {
    for (let i = 0; i < container.size; i++) {
      const item = container.getItem(i);
      if (!item || item.typeId !== seedId) continue;

      if (item.amount > 1) {
        item.amount--;
        container.setItem(i, item);
      } else {
        container.setItem(i, undefined);
      }

      return true;
    }
    return false;
  } catch (error) {
    console.error("consumeSeed: " + error);
  }
};

function handleAutoReplant(event) {
  try {
    const player = event.player;
    const block = event.block;
    const perm = event.brokenBlockPermutation;

    if (!perm) return;

    const id = perm.type?.id;
    if (!id) return;

    const seedId = cropMap[id];
    if (!seedId) return;

    if (perm.getState("growth") !== 7) return;

    const container = player.getComponent("inventory")?.container;
    if (!container) return;

    const planted = consumeSeed(container, seedId);

    if (planted) {
      const newPerm = getPerm(id);
      if (newPerm) block.setPermutation(newPerm);
    }
  } catch (error) {
    console.error("handleAutoReplant: " + error);
  }
}

export { handleAutoReplant };
