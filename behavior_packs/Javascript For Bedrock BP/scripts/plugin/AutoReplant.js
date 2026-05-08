import { BlockPermutation } from "@minecraft/server";


/** @type {Record<string, string>} */
const CROP_MAP = {
  "minecraft:wheat": "minecraft:wheat_seeds",
  "minecraft:carrots": "minecraft:carrot",
  "minecraft:potatoes": "minecraft:potato",
  "minecraft:beetroot": "minecraft:beetroot_seeds",
};


/** @type {Record<string, import("@minecraft/server").BlockPermutation|null>} */
const permCache = Object.create(null);

/**
 * @param {string} id
 * @returns {import("@minecraft/server").BlockPermutation|null}
 */
const getPerm = (id) => {
  if (id in permCache) return permCache[id];
  let perm = null;
  try {
    perm = BlockPermutation.resolve(id).withState("growth", 0);
  } catch {
  }
  permCache[id] = perm;
  return perm;
};


/**
 * @param {import("@minecraft/server").Container} container
 * @param {string} seedId
 * @returns {boolean}
 */
const consumeSeed = (container, seedId) => {
  const size = container.size;
  for (let i = 0; i < size; i++) {
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


/**
 * @param {import("@minecraft/server").PlayerBreakBlockBeforeEvent} event
 */
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
