import { PASS_THROUGH_BLOCKS } from "../constants";
import { blockCache } from "../core/state";

export function getBlockTypeId(dimension, pos) {
  const x = Math.floor(pos.x), y = Math.floor(pos.y), z = Math.floor(pos.z);
  const key = `${dimension.id}:${x},${y},${z}`;

  const cached = blockCache.get(key);
  if (cached !== undefined) return cached === "\0" ? undefined : cached;

  try {
    const typeId = dimension.getBlock({ x, y, z })?.typeId;
    blockCache.set(key, typeId ?? "\0");
    return typeId;
  } catch {
    blockCache.set(key, "\0");
    return undefined;
  }
}

export const isPassable = (dim, pos) => PASS_THROUGH_BLOCKS.has(getBlockTypeId(dim, pos) ?? "");
