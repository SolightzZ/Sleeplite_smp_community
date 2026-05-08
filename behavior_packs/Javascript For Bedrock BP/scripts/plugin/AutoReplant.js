import { BlockPermutation } from "@minecraft/server";

const CROP_MAP = {
  "minecraft:wheat": "minecraft:wheat_seeds",
  "minecraft:carrots": "minecraft:carrot",
  "minecraft:potatoes": "minecraft:potato",
  "minecraft:beetroot": "minecraft:beetroot_seeds",
};

const permCache = Object.create(null);

const getPerm = (id) => {
  if (id in permCache) return permCache[id];
  let perm = null;
  try {
    perm = BlockPermutation.resolve(id).withState("growth", 0);
  } catch (e) {
    console.error("getPerm: " + e);
  }
  permCache[id] = perm;
  return perm;
};

const consumeSeed = (container, seedId) => {
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
};

export const handleAutoReplant = (event) => {
  const player = event.player;
  if (!player?.isValid) return;

  const perm = event.brokenBlockPermutation;
  if (!perm) return;

  const id = perm.type?.id;
  if (!id) return;

  const seedId = CROP_MAP[id];
  if (!seedId) return;

  if (perm.getState("growth") !== 7) return;

  const container = player.getComponent("minecraft:inventory")?.container;
  if (!container) return;

  if (consumeSeed(container, seedId)) {
    const newPerm = getPerm(id);
    if (newPerm) event.block.setPermutation(newPerm);
  }
};
