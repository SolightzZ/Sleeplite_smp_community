import { shop } from "./rules.js";

const memory = new Map();
let count = 1;

const ask = (block) => {
  const place = `${block.location.x}_${block.location.y}_${block.location.z}`;

  if (memory.has(place)) {
    return memory.get(place);
  }

  const index = (count - 1) % shop.length;
  const gift = shop[index];

  const data = {
    id: gift.id,
    hp: gift.hp,
  };

  memory.set(place, data);
  count++;

  return data;
};

const forget = (block) => {
  const place = `${block.location.x}_${block.location.y}_${block.location.z}`;
  memory.delete(place);
};

export { ask, forget };
