const list = new Set(
  Array.from({ length: 16 }, (_, i) => `minecraft:light_block_${i}`),
);
const max = 3;
const range = 16;
const limit = 64;
const wait = 150;
const gang = new Set();

export { list, max, range, limit, wait, gang };
