import { ItemStack } from "@minecraft/server";
import { item } from "./data.js";
import { posInt, worldName } from "./util.js";

export const drop = (player, dmg) => {
  if (!player || !player.isValid) return;

  const { name, dimension, location } = player;
  const pos = posInt(location);
  const dim = worldName(dimension.id);
  const msg = `§7[/] ${name} died at §c${pos.x} ${pos.y} ${pos.z} §7in ${dim}`;

  player.sendMessage(msg);

  const key = item(name);
  if (!key) return;

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

  const it = new ItemStack(key, 1);
  const setLores = [
    `§r§8Killer: §9${killer}`,
    `§r§8Location: §9${pos.x} ${pos.y} ${pos.z}`,
    `§r§8Dimension: §9${dim}`,
  ];
  it.setLore(setLores);

  if (dmg?.cause === "void") {
    const minY = dimension.heightRange.min + 1;
    if (dimension.id === "minecraft:the_end") {
      pos.y = 64;
    } else {
      pos.y = Math.max(pos.y, minY);
    }
  }

  try {
    dimension.spawnItem(it, pos);
  } catch { }
};
