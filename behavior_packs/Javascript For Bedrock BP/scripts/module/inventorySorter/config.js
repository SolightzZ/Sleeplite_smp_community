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
    chess: { value: 'chess', description: 'รูปแบบตารางหมากรุก' },
    line: { value: 'line', description: 'รูปแบบแถวแนวนอน' },
    column: { value: 'column', description: 'รูปแบบแถวแนวตั้ง' },
};
