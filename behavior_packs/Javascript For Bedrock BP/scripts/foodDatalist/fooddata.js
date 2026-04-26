export const foods = [
  { id: "minecraft:potion", restore: 0, sat: 0, thirst: 6 },
  { id: "addon:water_bottle", restore: 0, sat: 0, thirst: 6 },
  { id: "minecraft:milk_bucket", restore: 0, sat: 0, thirst: 15 },
  { id: "minecraft:apple", restore: 0, sat: 2.4, thirst: 3 },
  { id: "minecraft:baked_potato", restore: 5, sat: 6, thirst: -1 },
  { id: "minecraft:beetroot", restore: 1, sat: 1.2, thirst: 0.7 },
  { id: "minecraft:beetroot_soup", restore: 6, sat: 7.2, thirst: 2 },
  { id: "minecraft:bread", restore: 5, sat: 6, thirst: -1 },
  { id: "minecraft:cake", restore: 0, sat: 0, thirst: -1 },
  { id: "minecraft:carrot", restore: 3, sat: 3.6, thirst: 0.7 },
  { id: "minecraft:chorus_fruit", restore: 4, sat: 2.4, thirst: 0.7 },
  { id: "minecraft:cooked_chicken", restore: 6, sat: 7.2, thirst: -1 },
  { id: "minecraft:cooked_cod", restore: 5, sat: 6, thirst: -1 },
  { id: "minecraft:cooked_mutton", restore: 6, sat: 9.6, thirst: -1 },
  { id: "minecraft:cooked_porkchop", restore: 8, sat: 12.8, thirst: -1 },
  { id: "minecraft:cooked_rabbit", restore: 5, sat: 6, thirst: -1 },
  { id: "minecraft:cooked_salmon", restore: 6, sat: 9.6, thirst: -1 },
  { id: "minecraft:cookie", restore: 2, sat: 0.4, thirst: -0.3 },
  { id: "minecraft:dried_kelp", restore: 1, sat: 0.2, thirst: -0.3 },
  { id: "minecraft:enchanted_golden_apple", restore: 4, sat: 9.6, thirst: 3 },
  { id: "minecraft:glow_berries", restore: 2, sat: 0.4, thirst: 3 },
  { id: "minecraft:golden_apple", restore: 4, sat: 9.6, thirst: 1 },
  { id: "minecraft:golden_carrot", restore: 6, sat: 14.4, thirst: 1.5 },
  { id: "minecraft:honey_bottle", restore: 6, sat: 1.2, thirst: 1 },
  { id: "minecraft:melon_slice", restore: 2, sat: 1.2, thirst: 3 },
  { id: "minecraft:mushroom_stew", restore: 6, sat: 7.2, thirst: 2 },
  { id: "minecraft:poisonous_potato", restore: 2, sat: 1.2, thirst: 0.5 },
  { id: "minecraft:potato", restore: 1, sat: 0.6, thirst: 0.5 },
  { id: "minecraft:pufferfish", restore: 1, sat: 0.28, thirst: -0.5 },
  { id: "minecraft:pumpkin_pie", restore: 8, sat: 4.8, thirst: -1 },
  { id: "minecraft:rabbit_stew", restore: 10, sat: 12, thirst: 1 },
  { id: "minecraft:beef", restore: 3, sat: 1.8, thirst: -1.5 },
  { id: "minecraft:chicken", restore: 2, sat: 1.2, thirst: -1 },
  { id: "minecraft:cod", restore: 2, sat: 0.4, thirst: -1 },
  { id: "minecraft:mutton", restore: 2, sat: 1.2, thirst: -1 },
  { id: "minecraft:porkchop", restore: 3, sat: 1.8, thirst: -1 },
  { id: "minecraft:rabbit", restore: 3, sat: 1.8, thirst: -1 },
  { id: "minecraft:salmon", restore: 2, sat: 0.4, thirst: -0.5 },
  { id: "minecraft:rotten_flesh", restore: 4, sat: 0.86, thirst: -1 },
  { id: "minecraft:spider_eye", restore: 2, sat: 3.22, thirst: -1 },
  { id: "minecraft:cooked_beef", restore: 8, sat: 12.8, thirst: -1 },
  { id: "minecraft:suspicious_stew", restore: 6, sat: 7.2, thirst: 2 },
  { id: "minecraft:sweet_berries", restore: 2, sat: 1.2, thirst: 1 },
  { id: "minecraft:tropical_fish", restore: 1, sat: 0.2, thirst: -0.5 },
];

export const colorRestore = "§r§c";
export const colorSat = "§r§6";
export const colorThirst = "§r§b";

export const loreRestore = "ฟื้นฟู";
export const loreSat = "อิ่ม";
export const loreThirst = "กระหาย";

export function makeLore(food) {
  const thirstSign = food.thirst >= 0 ? "+" : "";

  return [
    `${colorRestore}${loreRestore} +${food.restore}`,
    `${colorSat}${loreSat} +${food.sat}`,
    `${colorThirst}${loreThirst} ${thirstSign}${food.thirst.toFixed(1)}`,
  ];
}

export function getFoodData(itemId) {
  const foodData = foods.find((food) => food.id === itemId);
  return foodData;
}
