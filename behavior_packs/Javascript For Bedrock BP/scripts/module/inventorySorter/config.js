export const defaultSortMode = 'type';
export const maxItemAmount = 255;

export const cmdSortInv = 'addon:r';
export const cmdSortContainer = 'addon:c';
export const enumSortMode = 'addon:SortingMode';

export const ColorCodes = {
   gold: '§6',
   white: '§f',
   gray: '§7',
   red: '§c',
   green: '§a',
   blue: '§9',
   yellow: '§e',
};

export const INVENTORY_SLOTS = {
   HOTBAR: 9,
   ROW: 9,
};

export const SortModes = {
   type: { value: 'type', description: 'เรียงตามชนิด' },
   low: { value: 'asc', description: 'เรียงตามจำนวนน้อยไปมาก' },
   max: { value: 'desc', description: 'เรียงตามจำนวนมากไปน้อย' },
   rarity: { value: 'rarity', description: 'เรียงตามความหายาก' },
   stack: { value: 'stack', description: 'เรียงตามขนาดกองสูงสุด' },
   tool: { value: 'tool', description: 'เรียงตามประเภทเครื่องมือ' },
   name: { value: 'name', description: 'เรียงตามชื่อไอเทม' },
   durability: { value: 'durability', description: 'เรียงตามความทนทาน' },
   enchant: { value: 'enchant', description: 'เรียงตามจำนวนการเสริมพลัง' },
   material: { value: 'material', description: 'เรียงตามระดับวัสดุ' },
   group: { value: 'group', description: 'เรียงตามกลุ่มวัสดุ (ไม้/หิน/โลหะ)' },
   chess: { value: 'chess', description: 'รูปแบบตารางหมากรุก' },
   line: { value: 'line', description: 'รูปแบบแถวแนวนอน' },
   column: { value: 'column', description: 'รูปแบบแถวแนวตั้ง' },
};

export const CATEGORY_KEYWORDS = [
   ['sword', 0],
   ['bow', 0],
   ['crossbow', 0],
   ['trident', 0],
   ['axe', 1],
   ['pickaxe', 1],
   ['shovel', 1],
   ['hoe', 1],
   ['shears', 1],
   ['flint_and_steel', 1],
   ['fishing_rod', 1],
   ['compass', 1],
   ['clock', 1],
   ['helmet', 2],
   ['chestplate', 2],
   ['leggings', 2],
   ['boots', 2],
   ['elytra', 2],
   ['apple', 3],
   ['bread', 3],
   ['meat', 3],
   ['cooked', 3],
   ['golden_carrot', 3],
   ['stew', 3],
   ['soup', 3],
   ['cake', 3],
   ['cookie', 3],
   ['beetroot', 3],
   ['melon', 3],
   ['carrot', 3],
   ['potato', 3],
   ['fish', 3],
   ['salmon', 3],
   ['_block', 4],
   ['stone', 4],
   ['wood', 4],
   ['plank', 4],
   ['brick', 4],
   ['concrete', 4],
   ['sand', 4],
   ['gravel', 4],
   ['dirt', 4],
   ['grass', 4],
   ['log', 4],
   ['leaves', 4],
   ['glass', 4],
   ['wool', 4],
   ['ingot', 5],
   ['gem', 5],
   ['dust', 5],
   ['nugget', 5],
   ['shard', 5],
   ['crystal', 5],
   ['scrap', 5],
];

export const msgPlayerInvalid = '§c[x] ผู้เล่นไม่ถูกต้องแล้ว';
export const msgNoInventory = '§c[x] ไม่พบช่องเก็บของ';
export const msgSorted = '§a[/] จัดเรียงเรียบร้อยแล้ว';
export const msgLookAtChest = '§c[!] กรุณามองไปที่หีบที่ต้องการจัดเรียง';
export const msgNotContainer = '§c[!] บล็อกนี้ไม่มีที่เก็บของ';
export const msgContainerEmpty = '§a[/] ที่เก็บของว่างเปล่า';
export const msgSortResult = '§e[inventory] §fจัดเรียงเรียบร้อยแล้ว';
