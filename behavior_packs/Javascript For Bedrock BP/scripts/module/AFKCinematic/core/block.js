import { PASS_THROUGH_BLOCKS, CONFIG } from "../config.js";
import { blockCache, framePool } from "./state.js";
import { dist3, lerp3Into } from "../utils/math.js";

let _blockCacheTick = 0;

export function tickBlockCache() {
  if (++_blockCacheTick >= CONFIG.blockCacheTTL) {
    blockCache.clear();
    _blockCacheTick = 0;
  }
}

export function getBlockTypeId(dimension, pos) {
  const x = Math.floor(pos.x),
    y = Math.floor(pos.y),
    z = Math.floor(pos.z);
  const key = `${dimension.id}:${x},${y},${z}`;
  const cached = blockCache.get(key);
  if (cached !== undefined) return cached === "\0" ? undefined : cached;

  if (blockCache.size >= CONFIG.blockCacheMax) {
    const iter = blockCache.keys();
    for (let i = 0; i < 64; i++) {
      const k = iter.next().value;
      if (k === undefined) break;
      blockCache.delete(k);
    }
  }

  const typeId = dimension.getBlock({ x, y, z })?.typeId;
  blockCache.set(key, typeId ?? "\0");
  return typeId;
}

export const isPassable = (dim, pos) =>
  PASS_THROUGH_BLOCKS.has(getBlockTypeId(dim, pos) ?? "");

export function liftAbove(dim, pos, skipLift = false) {
  const p = framePool.lifted;
  p.x = pos.x;
  p.y = pos.y;
  p.z = pos.z;
  if (skipLift) return p;
  for (let i = 0; i < 6; i++) {
    if (isPassable(dim, p)) return p;
    p.y += 0.5;
  }
  return p;
}

export function pullCamera(dim, focus, desired, shotH = 0) {
  const travel = dist3(focus, desired);
  if (travel <= 0.001) return liftAbove(dim, desired, shotH > 5);

  const steps = Math.min(
    24,
    Math.max(2, Math.ceil(travel / CONFIG.collisionStep)),
  );
  const safe = framePool.safe;
  safe.x = focus.x;
  safe.y = focus.y;
  safe.z = focus.z;
  const sample = framePool.sample;

  for (let i = 1; i <= steps; i++) {
    lerp3Into(sample, focus, desired, i / steps);
    if (!isPassable(dim, sample)) {
      const retreat = Math.min(1, CONFIG.collisionBuffer / travel);
      lerp3Into(sample, desired, safe, retreat);
      return liftAbove(dim, sample, shotH > 5);
    }
    safe.x = sample.x;
    safe.y = sample.y;
    safe.z = sample.z;
  }

  return liftAbove(dim, desired, shotH > 5);
}
