import { ItemStack, system } from "@minecraft/server";

const IRON_INGOT = "minecraft:iron_ingot";
const CHIPPED_ANVIL = "minecraft:chipped_anvil";
const DAMAGED_ANVIL = "minecraft:damaged_anvil";

const applyRepair = (block, perm, damage, player, item) => {
  try {
    system.run(() => {
      let newDamage;
      if (damage === "very_damaged") newDamage = "slightly_damaged";
      else if (damage === "slightly_damaged") newDamage = "undamaged";
      else return;

      block.setPermutation(perm.withState("damage", newDamage));
      player.playSound("random.anvil_use", { volume: 1, pitch: 1 });

      const inv = player.getComponent("inventory")?.container;
      if (!inv) return;

      const slot = player.selectedSlotIndex;
      const amt = item.amount;

      if (amt > 1) {
        inv.setItem(slot, new ItemStack(item.typeId, amt - 1));
      } else {
        inv.setItem(slot, undefined);
      }
    });
  } catch (e) {
    console.error("applyRepair", e.message);
  }
};

export const handleRepairAnvil = (ev) => {
  try {
    const block = ev.block;
    const player = ev.player;
    const item = ev.item;

    if (!player || !player.isValid) return;
    if (!item || item.typeId !== IRON_INGOT || player.isSneaking) return;

    const typeId = block.typeId;
    if (typeId !== CHIPPED_ANVIL && typeId !== DAMAGED_ANVIL) return;

    const perm = block.permutation;
    const damage = perm.getState("damage");
    if (damage === "undamaged") return;

    ev.cancel = true;
    applyRepair(block, perm, damage, player, item);
  } catch (e) {
    console.warn("handleRepairAnvil", e.message);
  }
};
