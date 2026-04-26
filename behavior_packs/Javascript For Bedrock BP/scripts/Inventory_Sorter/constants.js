export const SORTING_MODES = {
  type: "type", // เรียงตามชนิดของไอเท็ม (ค่าเริ่มต้น)
  low: "asc", // เรียงตามจำนวน: น้อย -> มาก
  max: "desc", // เรียงตามจำนวน: มาก -> น้อย
  rarity: "rarity", // เรียงตามความหายาก
  stack: "stack", // เรียงตามความจุต่อช่อง (กองได้ 64 -> 16 -> 1)
  tool: "tool", // เรียงตามหมวดหมู่ (อาวุธ -> เครื่องมือ -> ชุดเกราะ -> อาหาร -> บล็อก)
  name: "name", // เรียงตามตัวอักษรชื่อภาษาอังกฤษ (A -> Z)
  durability: "durability", // เรียงตามความทนทาน (ของใหม่ 100% -> ของใกล้พัง)
  chess: "chess", // จัดลาย: แบบตารางหมากรุก (ใส่ 1 ช่อง เว้น 1 ช่อง)
  line: "line", // จัดลาย: แบบแถวแนวนอน (ใส่ 1 แถว เว้น 1 แถว)
  column: "column", // จัดลาย: แบบแถวแนวตั้ง (ใส่ 1 คอลัมน์ เว้น 1 คอลัมน์)
};

export const RARITY_ORDER = {
  // Common
  "minecraft:dirt": 0,
  "minecraft:cobblestone": 0,
  "minecraft:stone": 0,
  "minecraft:wood": 0,
  "minecraft:oak_planks": 0,

  // Uncommon
  "minecraft:iron_ingot": 1,
  "minecraft:coal": 1,
  "minecraft:copper_ingot": 1,

  // Rare
  "minecraft:gold_ingot": 2,
  "minecraft:diamond": 2,
  "minecraft:emerald": 2,

  // Epic
  "minecraft:netherite_ingot": 3,
  "minecraft:netherite_scrap": 3,
};

export const ITEM_CATEGORIES = {
  weapon: 0,
  tool: 1,
  armor: 2,
  food: 3,
  block: 4,
  material: 5,
  misc: 6,
};

export const Colors = {
  gold: "§6",
  white: "§f",
  gray: "§7",
  red: "§c",
  green: "§a",
  blue: "§9",
  yellow: "§e",
};

export const SETTINGS = {
  HOTBAR_SIZE: 9,
};
