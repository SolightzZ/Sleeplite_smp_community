import {
  ItemComponentTypes,
  ItemStack,
  system,
  world,
} from "@minecraft/server";

const LOG_TYPES = new Set([
  "minecraft:oak_log",
  "minecraft:birch_log",
  "minecraft:spruce_log",
  "minecraft:jungle_log",
  "minecraft:acacia_log",
  "minecraft:dark_oak_log",
  "minecraft:mangrove_log",
  "minecraft:cherry_log",
  "minecraft:pale_oak_log",
  "minecraft:crimson_stem",
  "minecraft:warped_stem",
]);

const LEAF_TYPES = new Set([
  "minecraft:oak_leaves",
  "minecraft:birch_leaves",
  "minecraft:spruce_leaves",
  "minecraft:jungle_leaves",
  "minecraft:acacia_leaves",
  "minecraft:dark_oak_leaves",
  "minecraft:mangrove_leaves",
  "minecraft:cherry_leaves",
  "minecraft:pale_oak_leaves",
  "minecraft:warped_wart_block",
  "minecraft:nether_wart_block",
  "minecraft:crimson_hyphae",
]);

const MAX_LOGS = 64;

const getSixNeighbors = (block) => [
  block.above(),
  block.below(),
  block.north(),
  block.south(),
  block.east(),
  block.west(),
];

// ตรวจสอบใบไม้รอบบล็อก: ตรวจสอบว่าบล็อกมีใบไม้อยู่ติดกันหรือไม่
const hasAdjacentLeaf = (block) => {
  try {
    const neighbors = getSixNeighbors(block);
    for (let i = 0; i < neighbors.length; i++) {
      const n = neighbors[i];
      if (n && LEAF_TYPES.has(n.typeId)) return true;
    }
    return false;
  } catch (error) {
    console.error("hasAdjacentLeaf: " + error);
  }
};

// ตรวจสอบโคนต้นไม้: เช็คว่าบล็อกเป็นฐานของต้นไม้จริง (มีลำต้นต่อขึ้นและมีใบไม้)
const isTreeBase = (block) => {
  try {
    if (!LOG_TYPES.has(block.typeId)) return false;

    const below = block.below();
    if (below && LOG_TYPES.has(below.typeId)) return false;

    const column = [block];
    let cur = block.above();
    while (cur && LOG_TYPES.has(cur.typeId)) {
      column.push(cur);
      cur = cur.above();
    }

    for (let i = 0; i < column.length; i++) {
      if (hasAdjacentLeaf(column[i])) return true;
    }
    return false;
  } catch (error) {
    console.error("isTreeBase: " + error);
  }
};

const damageAxe = (player) => {
  try {
    const inventory = player.getComponent("minecraft:inventory");
    if (!inventory?.container) return;

    const slot = inventory.container.getSlot(player.selectedSlotIndex);
    const item = slot.getItem();
    if (!item) return;

    const durability = item.getComponent(ItemComponentTypes.Durability);
    if (!durability || durability.unbreakable) return;

    const chance = durability.getDamageChance
      ? durability.getDamageChance(0)
      : 100 /
        ((item
          .getComponent("minecraft:enchantable")
          ?.getEnchantment("unbreaking")?.level ?? 0) +
          1);

    if (Math.random() * 100 > chance) return;

    durability.damage += 1;

    if (durability.damage >= durability.maxDurability) {
      slot.setItem(undefined);
      player.dimension.playSound("random.break", player.location);
    } else {
      slot.setItem(item);
    }
  } catch (error) {
    console.error("damageAxe: " + error);
  }
};

// ตัดต้นไม้ทั้งต้น: ค้นหาและทำลายบล็อกไม้ที่เชื่อมต่อกันทั้งหมดแบบค่อยเป็นค่อยไป
const breakTree = (startBlock, player) => {
  try {
    const { dimension, typeId: targetId } = startBlock;

    const visited = new Set();
    const stack = [startBlock];
    const allLogs = [];

    while (stack.length > 0 && allLogs.length < MAX_LOGS) {
      const block = stack.pop();
      if (!block || block.typeId !== targetId) continue;

      const k = `${block.location.x},${block.location.y},${block.location.z}`;
      if (visited.has(k)) continue;
      visited.add(k);
      allLogs.push(block);

      const neighbors = getSixNeighbors(block);
      for (let i = 0; i < neighbors.length; i++) {
        const n = neighbors[i];
        if (!n || n.typeId !== targetId) continue;
        const nk = `${n.location.x},${n.location.y},${n.location.z}`;
        if (!visited.has(nk)) stack.push(n);
      }
    }

    let index = 0;
    const handle = system.runInterval(() => {
      if (index >= allLogs.length) {
        system.clearRun(handle);
        return;
      }

      const block = allLogs[index++];

      if (!block || block.typeId !== targetId) return;

      block.setType("minecraft:air");
      dimension.spawnItem(new ItemStack(targetId, 1), block.location);
      damageAxe(player);
    }, 1);
  } catch (error) {
    console.error("breakTree: " + error);
  }
};

// จัดการการตัดต้นไม้: ตรวจสอบเงื่อนไขและเรียกใช้งานระบบ TreeCapitator
const handleTreeCapitator = (event) => {
  try {
    const { player, block, itemStack } = event;
    if (!player.isSneaking) return;

    const typeId = itemStack?.typeId;
    if (!typeId || !typeId.includes("axe") || typeId.includes("pick")) return;

    if (!isTreeBase(block)) return;

    breakTree(block, player);
  } catch (error) {
    console.error("handleTreeCapitator: " + error);
  }
};

world.beforeEvents.playerBreakBlock.subscribe(handleTreeCapitator);
