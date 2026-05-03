import {
  EquipmentSlot,
  ItemComponentTypes,
  ItemStack,
  system,
  world,
} from "@minecraft/server";
import { ORE_DROP, ORE_XP, PICKAXE_BREAKS } from "./Config";

// Constants
const MAX_BLOCKS_PER_VEIN = 96;
const GLOBAL_BUDGET_PER_TICK = 32; // total blocks
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

// Helpers
const locationKey = ({ x, y, z }) => `${x},${y},${z}`;

const offsetLocation = (loc, off) => ({
  x: loc.x + off.x,
  y: loc.y + off.y,
  z: loc.z + off.z,
});

const getBlockSafe = (dimension, location) => {
  try {
    return dimension.getBlock(location);
  } catch {
    return undefined;
  }
};

const getSameOreNeighbors = (block, targetId) => {
  const { dimension, location } = block;
  const out = [];
  for (const dir of DIRECTIONS) {
    const nb = getBlockSafe(dimension, offsetLocation(location, dir));
    if (nb?.typeId === targetId) out.push(nb);
  }
  return out;
};

const getEnchantData = (item) => {
  const enc = item?.getComponent(ItemComponentTypes.Enchantable);
  if (!enc) return { fortuneLevel: 0, hasSilkTouch: false, unbreakingLevel: 0 };
  return {
    fortuneLevel: enc.getEnchantment("fortune")?.level ?? 0,
    hasSilkTouch: Boolean(enc.getEnchantment("silk_touch")),
    unbreakingLevel: enc.getEnchantment("unbreaking")?.level ?? 0,
  };
};

const clampUnbreakingLevel = (n) => {
  return Math.max(0, Math.min(3, n | 0));
};

const shouldDamageDurability = (durability, unbreakingLevel) => {
  const chance = durability.getDamageChance(
    clampUnbreakingLevel(unbreakingLevel),
  );
  if (!Number.isFinite(chance) || chance <= 0) return false;
  return Math.random() * (chance > 1 ? 100 : 1) < chance;
};

const applyDurabilityDamage = (item, unbreakingLevel = 0) => {
  try {
    const dur = item.getComponent(ItemComponentTypes.Durability);
    if (!dur || !dur.isValid || dur.unbreakable) return item;
    if (!shouldDamageDurability(dur, unbreakingLevel)) return item;
    const next = dur.damage + 1;
    if (next >= dur.maxDurability) {
      dur.damage = dur.maxDurability;
      return "break";
    }
    dur.damage = next;
  } catch (e) {
    console.warn(`[VeinMiner] durability error: ${e}`);
  }
  return item;
};

const getDropTypeId = (targetId, hasSilkTouch) => {
  return hasSilkTouch ? targetId : ORE_DROP[targetId];
};

const getDropAmount = (fortuneLevel, hasSilkTouch) => {
  if (hasSilkTouch || fortuneLevel <= 0) return 1;
  return Math.floor(Math.random() * fortuneLevel) + 2;
};

const getXpAmount = (targetId) => {
  const xp = ORE_XP[targetId];
  if (!xp?.length) return 0;
  return xp[Math.floor(Math.random() * xp.length)];
};

const getBlockCenter = (block) => {
  if (block.center) return block.center();
  const { x, y, z } = block.location;
  return { x: x + 0.5, y: y + 0.5, z: z + 0.5 };
};

const spawnDrops = (dimension, location, dropTypeId, amount, xpAmount) => {
  if (dropTypeId && amount > 0)
    dimension.spawnItem(new ItemStack(dropTypeId, amount), location);
  for (let i = 0; i < xpAmount; i++)
    dimension.spawnEntity("minecraft:xp_orb", location);
};

const playPlayerSound = (player, soundId, location, options = {}) => {
  try {
    player?.playSound(soundId, { location, volume: SOUND_VOLUME, ...options });
  } catch (e) {
    console.warn(`[VeinMiner] sound error: ${e}`);
  }
};

// เรียกครั้งเดียวตอน enqueue ไม่ใช่ขณะ mining
const scanVein = (startBlock, targetId) => {
  const visited = new Set([locationKey(startBlock.location)]);
  const queue = [startBlock];
  const result = [];

  while (queue.length > 0 && result.length < MAX_BLOCKS_PER_VEIN) {
    const current = queue.shift();
    result.push({ ...current.location });

    for (const nb of getSameOreNeighbors(current, targetId)) {
      const key = locationKey(nb.location);
      if (!visited.has(key)) {
        visited.add(key);
        queue.push(nb);
      }
    }
  }

  // ตัด block ที่ผู้เล่น break เองออก
  return result.slice(1);
};

class GlobalQueueManager {
  constructor() {
    this.queues = new Map();
    this.intervalId = undefined;
  }

  enqueue(player, job) {
    if (job.blocks.length === 0) return;

    if (!this.queues.has(player.id)) {
      this.queues.set(player.id, []);
    }
    this.queues.get(player.id).push(job);

    if (this.intervalId === undefined) {
      this.intervalId = system.runInterval(() => this.tick(), 1);
    }
  }

  tick() {
    if (this.queues.size === 0) {
      this.stop();
      return;
    }

    // แจก budget ให้ทุก player ที่มีงานอยู่อย่างเท่ากัน
    const activePlayers = [...this.queues.keys()];
    const budgetEach = Math.max(
      1,
      Math.floor(GLOBAL_BUDGET_PER_TICK / activePlayers.length),
    );

    for (const playerId of activePlayers) {
      const jobs = this.queues.get(playerId);
      if (!jobs || jobs.length === 0) {
        this.queues.delete(playerId);
        continue;
      }

      // ดึง dimension + player จาก world (lazy)
      let player;
      try {
        player = world.getAllPlayers().find((p) => p.id === playerId);
      } catch (error) {
        console.error(`[VeinMiner] tick: ${error}`);
      }

      if (!player) {
        // player ออกจากเซิร์ฟ ล้าง queue ทิ้ง
        this.queues.delete(playerId);
        continue;
      }

      let mined = 0;

      while (mined < budgetEach && jobs.length > 0) {
        const job = jobs[0];
        if (job.blocks.length === 0) {
          jobs.shift();
          continue;
        }

        // ตรวจ pickaxe ยังถืออยู่ไหม
        const equipment = player.getComponent("minecraft:equippable");
        const liveItem = equipment?.getEquipment(EquipmentSlot.Mainhand);
        if (!liveItem || liveItem.typeId !== job.pickaxeId) {
          // ยกเลิก job นี้
          jobs.shift();
          continue;
        }

        // dimension live ref
        const pos = job.blocks.shift();
        const dim = player.dimension;
        const block = getBlockSafe(dim, pos);

        // block เปลี่ยนแปลง
        if (!block || block.typeId !== job.targetId) continue;

        try {
          const dropAmount = getDropAmount(job.fortuneLevel, job.hasSilkTouch);
          const xpAmount = getXpAmount(job.targetId);
          const dropLoc = getBlockCenter(block);

          block.setType("minecraft:air");
          spawnDrops(dim, dropLoc, job.dropTypeId, dropAmount, xpAmount);
          playPlayerSound(player, SOUND_DIG, dropLoc, {
            pitch: SOUND_PITCH_BASE + Math.random() * SOUND_PITCH_VARIANCE,
          });

          const result = applyDurabilityDamage(liveItem, job.unbreakingLevel);
          if (result === "break") {
            equipment.setEquipment(EquipmentSlot.Mainhand, undefined);
            playPlayerSound(player, SOUND_BREAK, player.location, {
              pitch: 1,
              volume: 1,
            });
            // ยกเลิกทุก job ของ player นี้
            this.queues.delete(playerId);
            break;
          }
          equipment.setEquipment(EquipmentSlot.Mainhand, liveItem);
          mined++;
        } catch (e) {
          console.warn(`[VeinMiner] processBlock error: ${e}`);
        }
      }
    }
  }

  stop() {
    if (this.intervalId !== undefined) {
      system.clearRun(this.intervalId);
      this.intervalId = undefined;
    }
  }

  // จำนวน blocks ที่ค้างอยู่ทั้งหมดใน queue
  pendingCount() {
    let n = 0;
    for (const jobs of this.queues.values())
      for (const j of jobs) n += j.blocks.length;
    return n;
  }
}

const globalQueue = new GlobalQueueManager();

const isOreVein = (block) => {
  if (!block) return false;
  return getSameOreNeighbors(block, block.typeId).length > 0;
};

function breakOreVein(block, item, player) {
  const validOres = PICKAXE_BREAKS[item?.typeId];
  const targetId = block?.typeId;
  if (!block || !validOres?.has(targetId)) return;

  const { fortuneLevel, hasSilkTouch, unbreakingLevel } = getEnchantData(item);
  const dropTypeId = getDropTypeId(targetId, hasSilkTouch);

  // หา vein เต็มก้อนก่อน แล้วค่อยส่งเข้า queue
  const blocks = scanVein(block, targetId);
  if (blocks.length === 0) return;

  globalQueue.enqueue(player, {
    blocks,
    dimensionId: block.dimension.id,
    targetId,
    pickaxeId: item.typeId,
    fortuneLevel,
    hasSilkTouch,
    unbreakingLevel,
    dropTypeId,
  });
}

export function VeinMiner(event) {
  try {
    const { player, block, itemStack } = event;
    if (
      player?.isSneaking &&
      PICKAXE_BREAKS[itemStack?.typeId] &&
      isOreVein(block)
    ) {
      breakOreVein(block, itemStack, player);
    }
  } catch (error) {
    console.error(" VeinMiner: " + error);
  }
}
