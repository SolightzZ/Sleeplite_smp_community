import {
  ItemComponentTypes,
  ItemStack,
  system,
  world,
} from "@minecraft/server";

const treeMap = new Map([
  ["minecraft:oak_log", "minecraft:oak_leaves"],
  ["minecraft:birch_log", "minecraft:birch_leaves"],
  ["minecraft:spruce_log", "minecraft:spruce_leaves"],
  ["minecraft:jungle_log", "minecraft:jungle_leaves"],
  ["minecraft:acacia_log", "minecraft:acacia_leaves"],
  ["minecraft:dark_oak_log", "minecraft:dark_oak_leaves"],
  ["minecraft:mangrove_log", "minecraft:mangrove_leaves"],
  ["minecraft:cherry_log", "minecraft:cherry_leaves"],
  ["minecraft:pale_oak_log", "minecraft:pale_oak_leaves"],
  ["minecraft:crimson_stem", "minecraft:nether_wart_block"],
  ["minecraft:warped_stem", "minecraft:warped_wart_block"],
]);

const CFG = {
  // blocks ที่จะ break ต่อ job ต่อ tick — ปรับตาม TPS จริง
  maxColumnHeight: 32,

  // จำนวน job สูงสุดที่รันใน 1 tick (ลด lag spike)
  blocksPerTick: 6,

  //  timeout ก่อน abandon job (ms)
  maxJobsPerTick: 6,

  // จำนวน active job สูงสุดต่อ player
  jobTimeoutMs: 15_000,

  // จำนวน active job สูงสุดต่อ player
  maxJobsPerPlayer: 2,
};

// State
const jobQueue = new Map();
const pendingTrees = new Set();
/** นับ active jobs ต่อ player เพื่อ enforce maxJobsPerPlayer */
const playerJobCount = new Map();

let jobSeq = 0;
let runHandle = null;

// Player job counter helpers
const incrementPlayerJobs = (playerId) => {
  const count = (playerJobCount.get(playerId) ?? 0) + 1;
  playerJobCount.set(playerId, count);
};

const decrementPlayerJobs = (playerId) => {
  const n = (playerJobCount.get(playerId) ?? 1) - 1;
  if (n <= 0) playerJobCount.delete(playerId);
  else playerJobCount.set(playerId, n);
};

const playerJobsFull = (playerId) =>
  (playerJobCount.get(playerId) ?? 0) >= CFG.maxJobsPerPlayer;

// Job lifecycle
const removeJob = (jobId, job) => {
  jobQueue.delete(jobId);
  pendingTrees.delete(job.treeKey);
  decrementPlayerJobs(job.playerId);
};

// Executor
const startExecutor = () => {
  if (runHandle !== null) {
    return;
  }

  runHandle = system.runInterval(() => {
    if (jobQueue.size === 0) {
      system.clearRun(runHandle);
      runHandle = null;
      return;
    }

    const now = Date.now();
    let jobsDone = 0;

    const jobs = Array.from(jobQueue);
    const jobLimit = Math.min(jobs.length, CFG.maxJobsPerTick);

    for (let i = 0; i < jobLimit; i++) {
      const [jobId, job] = jobs[i];

      // Timeout
      if (now - job.startMs > CFG.jobTimeoutMs) {
        removeJob(jobId, job);
        continue;
      }

      // Player ออกไปแล้ว
      if (!job.player.isValid) {
        removeJob(jobId, job);
        continue;
      }

      // Break blocks
      const blockLimit = Math.min(
        CFG.blocksPerTick,
        job.locations.length - job.index,
      );

      for (let i = 0; i < blockLimit; i++) {
        const loc = job.locations[job.index++];
        try {
          const block = job.dimension.getBlock(loc);
          if (!block) {
            continue;
          }
          if (block.typeId !== job.typeId) {
            continue;
          }
          block.setType("minecraft:air");
          job.dimension.spawnItem(new ItemStack(job.typeId, 1), loc);
          damageAxe(job.player);
        } catch (e) {}
      }

      // Job เสร็จ
      if (job.index >= job.locations.length) {
        removeJob(jobId, job);
      }

      jobsDone++;
    }
  }, 1);
};

// Helpers
// ตรวจว่า block มี leaf อยู่รอบๆ (6 ทิศ)
const hasAdjacentLeaf = (block, leafTypeId) => {
  for (let i = 0; i < 6; i++) {
    try {
      let n;
      if (i === 0) n = block.north();
      else if (i === 1) n = block.south();
      else if (i === 2) n = block.east();
      else if (i === 3) n = block.west();
      else if (i === 4) n = block.above();
      else n = block.below();

      if (n && n.typeId === leafTypeId) {
        return true;
      }
    } catch (e) {}
  }
  return false;
};

// รวบรวม log column แนวตั้ง (Y+) จาก startBlock  คืน { locations, hasLeaf }
const collectYColumn = (startBlock, logTypeId, leafTypeId) => {
  const locations = [];
  let hasLeaf = false;
  let cur = startBlock;

  for (let i = 0; i < CFG.maxColumnHeight; i++) {
    if (!cur || cur.typeId !== logTypeId) break;

    locations.push({ ...cur.location });
    if (!hasLeaf && hasAdjacentLeaf(cur, leafTypeId)) hasLeaf = true;
    try {
      cur = cur.above();
    } catch (e) {
      break;
    }
  }

  return { locations, hasLeaf };
};

//  ลด durability ของขวานที่ถือ รองรับ Unbreaking enchant
const damageAxe = (player) => {
  try {
    const inv = player.getComponent("minecraft:inventory");
    if (!inv?.container) {
      return;
    }

    const slot = player.selectedSlotIndex;
    const item = inv.container.getItem(slot);
    if (!item) {
      return;
    }

    const dur = item.getComponent(ItemComponentTypes.Durability);
    if (!dur || dur.unbreakable) {
      return;
    }

    const unbreaking =
      item.getComponent("minecraft:enchantable")?.getEnchantment("unbreaking")
        ?.level ?? 0;

    // สูตร Unbreaking: random% chance to skip damage
    if (Math.random() * 100 > 100 / (unbreaking + 1)) {
      return;
    }

    dur.damage += 1;

    if (dur.damage >= dur.maxDurability) {
      inv.container.setItem(slot, undefined);
      player.dimension.playSound("random.break", player.location);
    } else {
      // ต้อง setItem กลับเพื่อ sync กับ client
      inv.container.setItem(slot, item);
    }
  } catch (e) {
    /* inventory closed / player invalid */
  }
};

function TreeCapitatorBreakBlock(event) {
  try {
    const { player, block, brokenBlockPermutation } = event;

    // Basic guards
    if (!player.isSneaking) {
      return;
    }

    const inv = player.getComponent("minecraft:inventory");
    const heldItem = inv?.container?.getItem(player.selectedSlotIndex);
    const heldId = heldItem?.typeId ?? "";
    if (!heldId.includes("axe") || heldId.includes("pick")) {
      return;
    }

    const logTypeId = brokenBlockPermutation.type.id;
    const leafTypeId = treeMap.get(logTypeId);
    if (!leafTypeId) {
      return;
    }

    // Per-player job limit
    const playerId = player.id;
    if (playerJobsFull(playerId)) {
      return;
    }

    // Duplicate-tree guard
    const dim = player.dimension;
    const loc = block.location;
    const treeKey = `${dim.id}:${loc.x},${loc.y},${loc.z}`;
    if (pendingTrees.has(treeKey)) {
      return;
    }

    //ดูว่ามี log อยู่เหนือ block ที่ตัดหรือเปล่า
    let startBlock;
    try {
      const above = dim.getBlock({ x: loc.x, y: loc.y + 1, z: loc.z });
      if (!above) {
        return;
      }
      if (above.typeId !== logTypeId) {
        return;
      }
      startBlock = above;
    } catch (e) {
      return;
    }

    //Collect + validate
    const { locations, hasLeaf } = collectYColumn(
      startBlock,
      logTypeId,
      leafTypeId,
    );
    if (!hasLeaf || locations.length === 0) {
      return;
    }

    //Enqueue
    const jobId = `tc${++jobSeq}`;
    pendingTrees.add(treeKey);
    incrementPlayerJobs(playerId);

    jobQueue.set(jobId, {
      player,
      dimension: dim,
      locations,
      typeId: logTypeId,
      index: 0,
      startMs: Date.now(),
      treeKey,
      playerId,
    });

    startExecutor();
  } catch (e) {
    console.error("[TreeCapitator]", e);
  }
}
// Event handler
world.afterEvents.playerBreakBlock.subscribe((event) => {});

export { TreeCapitatorBreakBlock };
