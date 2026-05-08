/**
 * @param {string} typeId - e.g. "minecraft:oak_log"
 * @returns {string}      - e.g. "Oak Log"
 */
export const formatBlockName = (typeId) => {
  const raw = typeId ? typeId.replace("minecraft:", "") : "unknown";
  const parts = raw.split("_");
  let out = "";
  for (let i = 0; i < parts.length; i++) {
    const w = parts[i];
    if (i > 0) out += " ";
    out += w.charAt(0).toUpperCase() + w.slice(1);
  }
  return out;
};

/**
 * @param {import("@minecraft/server").ItemStack|null|undefined} item
 * @returns {string}
 */
export const getItemDisplayName = (item) => {
  if (!item?.typeId) return "zzz";
  if (item.nameTag) return item.nameTag.toLowerCase();
  const raw = item.typeId.replace("minecraft:", "");
  const parts = raw.split("_");
  let out = "";
  for (let i = 0; i < parts.length; i++) {
    const w = parts[i];
    if (i > 0) out += " ";
    out += w.charAt(0).toUpperCase() + w.slice(1);
  }
  return out.toLowerCase();
};

/**
 * Returns durability percentage 0-100 (100 = brand new, 0 = broken).
 * Items without durability return 100 (treat as full).
 * @param {import("@minecraft/server").ItemStack|null|undefined} item
 * @returns {number}
 */
export const getItemDurability = (item) => {
  if (!item) return 0;
  const comp = item.getComponent("minecraft:durability");
  if (!comp) return 100;
  const max = comp.maxDurability;
  if (!max) return 100;
  return ((max - (comp.damage || 0)) / max) * 100;
};
