import { ItemStack } from "@minecraft/server";
import { getHead } from "./data.js";
import { posInt, worldName } from "./util.js";

export const dropHead = (player, dmg) => {
  try {
    if (!player || !player.isValid) return;

    const name = player.name;
    const dim = player.dimension;
    const loc = player.location;
    const pos = posInt(loc);
    const dimName = worldName(dim.id);

    player.sendMessage(
      `§7[/] ${name} died at §c${pos.x} ${pos.y} ${pos.z} §7in ${dimName}`,
    );

    const headId = getHead(name);
    if (!headId) return;

    let killer = "Unknown";
    const src = dmg?.damagingEntity;

    if (src && src.isValid) {
      if (src.typeId === "minecraft:player") {
        killer = src.name;
      } else {
        killer = src.typeId.replace("minecraft:", "");
      }
    } else if (dmg?.cause) {
      killer = String(dmg.cause);
    }

    const item = new ItemStack(headId, 1);
    item.setLore([
      `§r§8Killer: §9${killer}`,
      `§r§8Location: §9${pos.x} ${pos.y} ${pos.z}`,
      `§r§8Dimension: §9${dimName}`,
    ]);

    if (dmg?.cause === "void") {
      const minY = dim.heightRange.min + 1;
      if (dim.id === "minecraft:the_end") {
        pos.y = 64;
      } else {
        pos.y = Math.max(pos.y, minY);
      }
    }

    dim.spawnItem(item, pos);
  } catch (e) {
    console.error("dropHead", e.message);
  }
};
