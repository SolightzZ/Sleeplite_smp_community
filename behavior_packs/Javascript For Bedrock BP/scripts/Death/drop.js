import { ItemStack, Player } from "@minecraft/server";
import { item } from "./data.js";
import { posInt, worldName } from "./util.js";

export function drop(player, dmg) {
  const name = player.name;
  const pos = posInt(player.location);
  const dim = worldName(player.dimension.id);
  const msg = `§7[/] ${name} died at §c${pos.x} ${pos.y} ${pos.z} §7in ${dim}`;

  player.sendMessage(msg);
  const key = item(name);
  const unknowns = "Unknown";
  if (!key) return;

  let killer = unknowns;
  const src = dmg?.damagingEntity;
  const x = ":";
  const IfPlayer = src instanceof Player;

  if (IfPlayer) killer = src.name;
  else if (src?.typeId) killer = src.typeId.split(x).pop();
  else if (dmg?.cause) killer = String(dmg.cause);

  const it = new ItemStack(key, 1);
  const setLores = [`§r§8Killer: §9${killer}`, `§r§8Location: §9${pos.x} ${pos.y} ${pos.z}`, `§r§8Dimension: §9${dim}`];
  it.setLore(setLores);

  let spawnPos = { ...pos };
  const DmgVoid = dmg?.cause === "void";

  if (DmgVoid) {
    const minY = player.dimension.heightRange.min + 1;
    const theend = player.dimension.id === "minecraft:the_end";

    if (theend) {
      spawnPos.y = 64;
    } else {
      spawnPos.y = Math.max(pos.y, minY);
    }
  }

  player.dimension.spawnItem(it, spawnPos);
}
