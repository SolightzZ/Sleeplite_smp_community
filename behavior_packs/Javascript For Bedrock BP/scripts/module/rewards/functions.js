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
    if (!inv?.container) return false;

    const container = inv.container;
    const size = container.size;
    const amountToAdd = player.hasTag(config.vipTag) ? count * config.vipMul : count;
    const maxStack = new ItemStack(id, 1).maxAmount;

    let remaining = amountToAdd;

    for (let i = 0; i < size && remaining > 0; i++) {
      const slotItem = container.getItem(i);
      if (slotItem?.typeId === id && slotItem.amount < maxStack) {
        const toAdd = Math.min(remaining, maxStack - slotItem.amount);
        slotItem.amount += toAdd;
        container.setItem(i, slotItem);
        remaining -= toAdd;
      }
    }

    for (let i = 0; i < size && remaining > 0; i++) {
      const slotItem = container.getItem(i);
      if (!slotItem) {
        const toAdd = Math.min(remaining, maxStack);
        container.setItem(i, new ItemStack(id, toAdd));
        remaining -= toAdd;
      }
    }

    if (remaining > 0) {
      console.warn(`[Give] Not enough space. ${remaining} items could not be given.`);
    }

    return true;
  } catch (e) {
    console.warn("[Give] Error:", e);
    return false;
  }
}

export { give, name, time };
