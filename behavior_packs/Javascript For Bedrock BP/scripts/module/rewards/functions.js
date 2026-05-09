import { ItemStack } from "@minecraft/server";
import { config } from "./constants.js";

function time() {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function name(id) {
  let text = id.split(":")[1] || id;
  return text.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function give(player, id, count) {
  try {
    const inv = player.getComponent("minecraft:inventory");
    if (!inv || !inv.container) return false;

    const container = inv.container;
    const size = container.size;

    let amountToAdd = count;
    if (player.hasTag(config.vipTag)) {
      amountToAdd = count * config.vipMul;
    }

    const dummyItem = new ItemStack(id, 1);
    const maxStack = dummyItem.maxAmount;

    let freeSpace = 0;

    for (let i = 0; i < size; i++) {
      const slotItem = container.getItem(i);

      if (!slotItem) {
        freeSpace += maxStack;
      } else if (slotItem.typeId === id) {
        if (slotItem.amount < maxStack) {
          freeSpace += maxStack - slotItem.amount;
        }
      }
    }

    if (freeSpace < amountToAdd) {
      console.warn(
        `[Give] Failed: Not enough space. Needed: ${amountToAdd}, Free: ${freeSpace}`,
      );
      return false;
    }

    let remaining = amountToAdd;

    for (let i = 0; i < size; i++) {
      if (remaining <= 0) break;

      const slotItem = container.getItem(i);

      if (slotItem && slotItem.typeId === id && slotItem.amount < maxStack) {
        const spaceInSlot = maxStack - slotItem.amount;
        const toAdd = Math.min(remaining, spaceInSlot);

        slotItem.amount += toAdd;
        container.setItem(i, slotItem);

        remaining -= toAdd;
      }
    }

    if (remaining > 0) {
      for (let i = 0; i < size; i++) {
        if (remaining <= 0) break;

        const slotItem = container.getItem(i);

        if (!slotItem) {
          const toAdd = Math.min(remaining, maxStack);

          const newItem = new ItemStack(id, toAdd);
          container.setItem(i, newItem);

          remaining -= toAdd;
        }
      }
    }

    return true;
  } catch (e) {
    console.warn("[ Give ] Give Error: " + e);
    return false;
  }
}

export { give, name, time };
