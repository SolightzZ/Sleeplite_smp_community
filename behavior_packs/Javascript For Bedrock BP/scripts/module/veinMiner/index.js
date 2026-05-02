import {
  EquipmentSlot,
  ItemComponentTypes,
  ItemStack,
  system,
} from "@minecraft/server";

const MAX_BLOCKS_PER_VEIN = 96;
const MAX_BLOCKS_PER_TICK = 16;
const SOUND_DIG = "dig.stone";
const SOUND_BREAK = "random.break";
const SOUND_VOLUME = 0.45;
const SOUND_PITCH_BASE = 0.85;
const SOUND_PITCH_VARIANCE = 0.25;

const DIRECTIONS = [
  { x: 0, y: 1, z: 0 },
  { x: 0, y: -1, z: 0 },
  { x: 0, y: 0, z: -1 },
  { x: 0, y: 0, z: 1 },
  { x: 1, y: 0, z: 0 },
  { x: -1, y: 0, z: 0 },
];

const PICKAXE_BREAKS = {
  "minecraft:wooden_pickaxe": new Set([
    "minecraft:coal_ore",
    "minecraft:deepslate_coal_ore",
    "minecraft:quartz_ore",
    "minecraft:nether_gold_ore",
  ]),

  "minecraft:stone_pickaxe": new Set([
    "minecraft:coal_ore",
    "minecraft:deepslate_coal_ore",
    "minecraft:quartz_ore",
    "minecraft:iron_ore",
    "minecraft:deepslate_iron_ore",
    "minecraft:copper_ore",
    "minecraft:deepslate_copper_ore",
    "minecraft:lapis_ore",
    "minecraft:deepslate_lapis_ore",
    "minecraft:nether_gold_ore",
  ]),

  "minecraft:copper_pickaxe": new Set([
    "minecraft:coal_ore",
    "minecraft:deepslate_coal_ore",
    "minecraft:iron_ore",
    "minecraft:deepslate_iron_ore",
    "minecraft:lapis_ore",
    "minecraft:deepslate_lapis_ore",
    "minecraft:copper_ore",
    "minecraft:deepslate_copper_ore",
    "minecraft:lit_redstone_ore",
    "minecraft:lit_deepslate_redstone_ore",
    "minecraft:nether_gold_ore",
    "minecraft:quartz_ore",
  ]),

  "minecraft:iron_pickaxe": new Set([
    "minecraft:coal_ore",
    "minecraft:deepslate_coal_ore",
    "minecraft:quartz_ore",
    "minecraft:iron_ore",
    "minecraft:deepslate_iron_ore",
    "minecraft:copper_ore",
    "minecraft:deepslate_copper_ore",
    "minecraft:lapis_ore",
    "minecraft:deepslate_lapis_ore",
    "minecraft:gold_ore",
    "minecraft:deepslate_gold_ore",
    "minecraft:redstone_ore",
    "minecraft:deepslate_redstone_ore",
    "minecraft:lit_redstone_ore",
    "minecraft:lit_deepslate_redstone_ore",
    "minecraft:diamond_ore",
    "minecraft:deepslate_diamond_ore",
    "minecraft:emerald_ore",
    "minecraft:deepslate_emerald_ore",
    "minecraft:nether_gold_ore",
  ]),

  "minecraft:golden_pickaxe": new Set([
    "minecraft:coal_ore",
    "minecraft:deepslate_coal_ore",
    "minecraft:quartz_ore",
    "minecraft:nether_gold_ore",
  ]),

  "minecraft:diamond_pickaxe": new Set([
    "minecraft:coal_ore",
    "minecraft:deepslate_coal_ore",
    "minecraft:quartz_ore",
    "minecraft:iron_ore",
    "minecraft:deepslate_iron_ore",
    "minecraft:copper_ore",
    "minecraft:deepslate_copper_ore",
    "minecraft:lapis_ore",
    "minecraft:deepslate_lapis_ore",
    "minecraft:gold_ore",
    "minecraft:deepslate_gold_ore",
    "minecraft:redstone_ore",
    "minecraft:deepslate_redstone_ore",
    "minecraft:lit_redstone_ore",
    "minecraft:lit_deepslate_redstone_ore",
    "minecraft:diamond_ore",
    "minecraft:deepslate_diamond_ore",
    "minecraft:emerald_ore",
    "minecraft:deepslate_emerald_ore",
    "minecraft:nether_gold_ore",
  ]),

  "minecraft:netherite_pickaxe": new Set([
    "minecraft:coal_ore",
    "minecraft:deepslate_coal_ore",
    "minecraft:quartz_ore",
    "minecraft:iron_ore",
    "minecraft:deepslate_iron_ore",
    "minecraft:copper_ore",
    "minecraft:deepslate_copper_ore",
    "minecraft:lapis_ore",
    "minecraft:deepslate_lapis_ore",
    "minecraft:gold_ore",
    "minecraft:deepslate_gold_ore",
    "minecraft:redstone_ore",
    "minecraft:deepslate_redstone_ore",
    "minecraft:lit_redstone_ore",
    "minecraft:lit_deepslate_redstone_ore",
    "minecraft:diamond_ore",
    "minecraft:deepslate_diamond_ore",
    "minecraft:emerald_ore",
    "minecraft:deepslate_emerald_ore",
    "minecraft:nether_gold_ore",
  ]),
};

const ORE_DROP = {
  "minecraft:coal_ore": "minecraft:coal",
  "minecraft:deepslate_coal_ore": "minecraft:coal",
  "minecraft:quartz_ore": "minecraft:quartz",

  "minecraft:iron_ore": "minecraft:raw_iron",
  "minecraft:deepslate_iron_ore": "minecraft:raw_iron",

  "minecraft:copper_ore": "minecraft:raw_copper",
  "minecraft:deepslate_copper_ore": "minecraft:raw_copper",

  "minecraft:lapis_ore": "minecraft:lapis_lazuli",
  "minecraft:deepslate_lapis_ore": "minecraft:lapis_lazuli",

  "minecraft:gold_ore": "minecraft:raw_gold",
  "minecraft:deepslate_gold_ore": "minecraft:raw_gold",

  "minecraft:redstone_ore": "minecraft:redstone",
  "minecraft:deepslate_redstone_ore": "minecraft:redstone",
  "minecraft:lit_redstone_ore": "minecraft:redstone",
  "minecraft:lit_deepslate_redstone_ore": "minecraft:redstone",

  "minecraft:diamond_ore": "minecraft:diamond",
  "minecraft:deepslate_diamond_ore": "minecraft:diamond",

  "minecraft:emerald_ore": "minecraft:emerald",
  "minecraft:deepslate_emerald_ore": "minecraft:emerald",

  "minecraft:nether_gold_ore": "minecraft:gold_nugget",
};

const ORE_XP = {
  "minecraft:coal_ore": [0, 1, 2],
  "minecraft:deepslate_coal_ore": [0, 1, 2],
  "minecraft:quartz_ore": [2, 3, 4, 5],

  "minecraft:iron_ore": [0],
  "minecraft:deepslate_iron_ore": [0],

  "minecraft:copper_ore": [0],
  "minecraft:deepslate_copper_ore": [0],

  "minecraft:lapis_ore": [2, 3, 4, 5],
  "minecraft:deepslate_lapis_ore": [2, 3, 4, 5],

  "minecraft:gold_ore": [0],
  "minecraft:deepslate_gold_ore": [0],

  "minecraft:redstone_ore": [1, 2, 3, 4, 5],
  "minecraft:deepslate_redstone_ore": [1, 2, 3, 4, 5],

  "minecraft:lit_redstone_ore": [1, 2, 3, 4, 5],
  "minecraft:lit_deepslate_redstone_ore": [1, 2, 3, 4, 5],

  "minecraft:diamond_ore": [3, 4, 5, 6, 7],
  "minecraft:deepslate_diamond_ore": [3, 4, 5, 6, 7],

  "minecraft:emerald_ore": [3, 4, 5, 6, 7],
  "minecraft:deepslate_emerald_ore": [3, 4, 5, 6, 7],

  "minecraft:nether_gold_ore": [0, 1],
};
// สร้างคีย์ตำแหน่ง: แปลงพิกัด x,y,z เป็น string สำหรับใช้เป็น key
const locationKey = ({ x, y, z }) => `${x},${y},${z}`;

// คำนวณตำแหน่งใหม่: บวก offset กับตำแหน่งเดิมเพื่อหา location ใหม่
const offsetLocation = (location, offset) => ({
  x: location.x + offset.x,
  y: location.y + offset.y,
  z: location.z + offset.z,
});

// ดึงบล็อกแบบปลอดภัย: เรียก getBlock และป้องกัน error หากตำแหน่งไม่ถูกต้อง
const getBlockSafe = (dimension, location) => {
  try {
    return dimension.getBlock(location);
  } catch {
    return undefined;
  }
};

// หาแร่ชนิดเดียวกันรอบบล็อก: คืนค่าบล็อกเพื่อนบ้านที่มี typeId ตรงกับเป้าหมาย
const getSameOreNeighbors = (block, targetId) => {
  const { dimension, location } = block;
  const neighbors = [];

  for (const direction of DIRECTIONS) {
    const neighbor = getBlockSafe(
      dimension,
      offsetLocation(location, direction),
    );
    if (neighbor?.typeId === targetId) {
      neighbors.push(neighbor);
    }
  }

  return neighbors;
};

// ดึงข้อมูลเอนชานต์: อ่านค่า fortune, silk touch และ unbreaking จากไอเทม
const getEnchantData = (item) => {
  const enchantable = item?.getComponent(ItemComponentTypes.Enchantable);

  if (!enchantable) {
    return { fortuneLevel: 0, hasSilkTouch: false, unbreakingLevel: 0 };
  }

  const fortune = enchantable.getEnchantment("fortune");
  const silk = enchantable.getEnchantment("silk_touch");
  const unbreaking = enchantable.getEnchantment("unbreaking");

  return {
    fortuneLevel: fortune?.level ?? 0,
    hasSilkTouch: Boolean(silk),
    unbreakingLevel: unbreaking?.level ?? 0,
  };
};

// จำกัดระดับ Unbreaking: บังคับค่าให้อยู่ในช่วง 0 ถึง 3
const clampUnbreakingLevel = (level) => Math.max(0, Math.min(3, level || 0));

// ตรวจสอบการลดความทนทาน: คำนวณโอกาสที่ไอเทมจะเสีย durability ตามระดับ Unbreaking
const shouldDamageDurability = (durability, unbreakingLevel) => {
  const damageChance = durability.getDamageChance(
    clampUnbreakingLevel(unbreakingLevel),
  );

  if (!Number.isFinite(damageChance) || damageChance <= 0) return false;

  const maxRoll = damageChance > 1 ? 100 : 1;
  return Math.random() * maxRoll < damageChance;
};

// ปรับลดความทนทานไอเทม: ตรวจสอบและเพิ่มค่า damage ตามโอกาส พร้อมคืนค่า item หรือสถานะ "break" หากพัง
const applyDurabilityDamage = (item, unbreakingLevel = 0) => {
  if (!item) return item;

  try {
    const durability = item.getComponent(ItemComponentTypes.Durability);
    if (!durability || !durability.isValid || durability.unbreakable) {
      return item;
    }

    if (!shouldDamageDurability(durability, unbreakingLevel)) {
      return item;
    }

    const nextDamage = durability.damage + 1;

    if (nextDamage >= durability.maxDurability) {
      durability.damage = durability.maxDurability;
      return "break";
    }

    durability.damage = nextDamage;
  } catch (error) {
    console.warn(`[VeinMiner] Failed to update durability: ${error}`);
  }

  return item;
};

// เลือกประเภทไอเทมดรอป: คืนค่า typeId ของไอเทมตาม Silk Touch หรือดรอปปกติของแร่
const getDropTypeId = (targetId, hasSilkTouch) => {
  hasSilkTouch ? targetId : ORE_DROP[targetId];
};

// คำนวณจำนวนไอเทมดรอป: กำหนดจำนวนดรอปตามระดับ Fortune หรือคืนค่า 1 หากมี Silk Touch
const getDropAmount = (fortuneLevel, hasSilkTouch) => {
  if (hasSilkTouch || fortuneLevel <= 0) return 1;
  return Math.floor(Math.random() * fortuneLevel) + 2;
};

// คำนวณค่า XP ที่ได้รับ: สุ่มค่าประสบการณ์จากตาราง ORE_XP ตามชนิดแร่
const getXpAmount = (targetId) => {
  const xpValues = ORE_XP[targetId];
  if (!xpValues?.length) return 0;
  return xpValues[Math.floor(Math.random() * xpValues.length)];
};

// หาจุดกึ่งกลางบล็อก: คืนค่าพิกัดตรงกลางของบล็อกสำหรับใช้ spawn ไอเทมหรือเอฟเฟกต์
const getBlockCenter = (block) => {
  if (block.center) {
    return block.center();
  }
  const { x, y, z } = block.location;
  return { x: x + 0.5, y: y + 0.5, z: z + 0.5 };
};

// สร้างของดรอปและ XP: ดรอปไอเทมและสร้างลูกแก้วประสบการณ์ตามจำนวนที่กำหนด
const spawnDrops = (dimension, location, dropTypeId, amount, xpAmount) => {
  if (dropTypeId && amount > 0) {
    dimension.spawnItem(new ItemStack(dropTypeId, amount), location);
  }
  for (let i = 0; i < xpAmount; i++) {
    dimension.spawnEntity("minecraft:xp_orb", location);
  }
};

// เล่นเสียงให้ผู้เล่น: เล่นเสียงที่กำหนด ณ ตำแหน่ง พร้อมตั้งค่า volume และ options เพิ่มเติม
const playPlayerSound = (player, soundId, location, options = {}) => {
  try {
    player?.playSound(soundId, {
      location,
      volume: SOUND_VOLUME,
      ...options,
    });
  } catch (error) {
    console.warn(`[VeinMiner] Failed to play sound ${soundId}: ${error}`);
  }
};

// ตรวจสอบสายแร่: เช็คว่าบล็อกมีแร่ชนิดเดียวกันเชื่อมต่ออยู่รอบ ๆ หรือไม่
export const isOreVein = (block) => {
  if (!block) return false;
  const targetId = block.typeId;
  return getSameOreNeighbors(block, targetId).length > 0;
};

// ตัดสายแร่ทั้งชุด: ขุดแร่ที่เชื่อมต่อกันทั้งหมดแบบทีละส่วน พร้อมคำนวณดรอป, XP, durability และเสียงเอฟเฟกต์
export const breakOreVein = (block, item, player) => {
  const validOres = PICKAXE_BREAKS[item?.typeId];
  const targetId = block?.typeId;

  if (!block || !validOres?.has(targetId)) return;

  const equipment = player?.getComponent("minecraft:equippable");
  if (!equipment) return;

  const dimension = block.dimension;
  const { fortuneLevel, hasSilkTouch, unbreakingLevel } = getEnchantData(item);
  const dropTypeId = getDropTypeId(targetId, hasSilkTouch);
  const queue = [];
  const visited = new Set([locationKey(block.location)]);

  const pushIfValid = (nextBlock) => {
    if (!nextBlock || nextBlock.typeId !== targetId) return;

    const key = locationKey(nextBlock.location);
    if (visited.has(key) || visited.size >= MAX_BLOCKS_PER_VEIN) return;

    visited.add(key);
    queue.push(nextBlock);
  };

  for (const neighbor of getSameOreNeighbors(block, targetId)) {
    pushIfValid(neighbor);
  }

  if (queue.length === 0) return;

  const runId = system.runInterval(() => {
    let processed = 0;
    while (queue.length > 0 && processed < MAX_BLOCKS_PER_TICK) {
      try {
        const current = queue.shift();
        if (!current || current.typeId !== targetId) continue;

        const dropAmount = getDropAmount(fortuneLevel, hasSilkTouch);
        const xpAmount = getXpAmount(targetId);
        const dropLocation = getBlockCenter(current);
        const liveItem = equipment.getEquipment(EquipmentSlot.Mainhand);

        if (!liveItem || liveItem.typeId !== item.typeId) {
          system.clearRun(runId);
          return;
        }

        current.setType("minecraft:air");
        spawnDrops(dimension, dropLocation, dropTypeId, dropAmount, xpAmount);
        playPlayerSound(player, SOUND_DIG, dropLocation, {
          pitch: SOUND_PITCH_BASE + Math.random() * SOUND_PITCH_VARIANCE,
        });

        const result = applyDurabilityDamage(liveItem, unbreakingLevel);

        if (result === "break") {
          equipment.setEquipment(EquipmentSlot.Mainhand, undefined);
          playPlayerSound(player, SOUND_BREAK, player.location, {
            pitch: 1,
            volume: 1,
          });
          system.clearRun(runId);
          return;
        }

        equipment.setEquipment(EquipmentSlot.Mainhand, liveItem);

        processed++;

        for (const neighbor of getSameOreNeighbors(current, targetId)) {
          pushIfValid(neighbor);
        }
      } catch (error) {
        console.warn(`[VeinMiner] Failed to mine ${targetId}: ${error}`);
      }
    }

    if (queue.length === 0) {
      system.clearRun(runId);
    }
  }, 2);
};

// จัดการ VeinMiner: ตรวจสอบเงื่อนไขและเรียกขุดสายแร่เมื่อผู้เล่นย่อและใช้ pickaxe ที่รองรับ
function VeinMiner(event) {
  const { player, block, itemStack } = event;
  if (
    player?.isSneaking &&
    PICKAXE_BREAKS[itemStack?.typeId] &&
    isOreVein(block)
  ) {
    breakOreVein(block, itemStack, player);
  }
}

export { VeinMiner };
