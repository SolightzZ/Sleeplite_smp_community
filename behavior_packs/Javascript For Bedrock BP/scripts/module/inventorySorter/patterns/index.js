/**
 * Chess pattern — even slots first, then odd slots.
 * Provides a checkerboard visual when viewing in a 9-wide container.
 * @param {(import("@minecraft/server").ItemStack|undefined)[]} items  - sorted, merged items
 * @param {number} containerSize
 * @returns {(import("@minecraft/server").ItemStack|undefined)[]}
 */
export const applyChessPattern = (items, containerSize) => {
  const result = new Array(containerSize);
  for (let i = 0; i < containerSize; i++) result[i] = undefined;

  let idx = 0;
  const itemsLen = items.length;

  // Fill even slots
  for (let i = 0; i < containerSize && idx < itemsLen; i += 2) {
    result[i] = items[idx++];
  }
  // Fill odd slots with remaining items
  for (let i = 1; i < containerSize && idx < itemsLen; i += 2) {
    result[i] = items[idx++];
  }
  return result;
};

/**
 * Line pattern — fills every even row first, then odd rows.
 * Row size is always 9 (standard Bedrock inventory width).
 * @param {(import("@minecraft/server").ItemStack|undefined)[]} items
 * @param {number} containerSize
 * @returns {(import("@minecraft/server").ItemStack|undefined)[]}
 */
export const applyLinePattern = (items, containerSize) => {
  const ROW = 9;
  const result = new Array(containerSize);
  for (let i = 0; i < containerSize; i++) result[i] = undefined;

  const itemsLen = items.length;
  let idx = 0;

  // Pass 1: even rows
  for (let i = 0; i < containerSize && idx < itemsLen; i++) {
    if (Math.floor(i / ROW) % 2 === 0) result[i] = items[idx++];
  }
  // Pass 2: odd rows
  for (let i = 0; i < containerSize && idx < itemsLen; i++) {
    if (Math.floor(i / ROW) % 2 !== 0) result[i] = items[idx++];
  }
  return result;
};

/**
 * Column pattern — fills every even column first, then odd columns.
 * Column is defined as slot % 9.
 * @param {(import("@minecraft/server").ItemStack|undefined)[]} items
 * @param {number} containerSize
 * @returns {(import("@minecraft/server").ItemStack|undefined)[]}
 */
export const applyColumnPattern = (items, containerSize) => {
  const ROW = 9;
  const result = new Array(containerSize);
  for (let i = 0; i < containerSize; i++) result[i] = undefined;

  const itemsLen = items.length;
  let idx = 0;

  // Pass 1: even columns
  for (let i = 0; i < containerSize && idx < itemsLen; i++) {
    if ((i % ROW) % 2 === 0) result[i] = items[idx++];
  }
  // Pass 2: odd columns
  for (let i = 0; i < containerSize && idx < itemsLen; i++) {
    if ((i % ROW) % 2 !== 0) result[i] = items[idx++];
  }
  return result;
};
