import {
  world,
  system,
  Direction,
  CommandPermissionLevel,
  CustomCommandStatus,
} from "@minecraft/server";

// Global interval ID สำหรับ seat check
let globalSeatCheckInterval = null;
const COMMAND_NAMESPACE = "addon";
const SIT_COMMAND_NAME = `${COMMAND_NAMESPACE}:sit`;
const SEAT_ENTITY_ID = "xassassin:sit";

const interactableBlockTypes = [
  "stairs",
  "slab",
  "log",
  "warped_stem",
  "crimson_stem",
  "wood",
  "hyphae",
  "creaking_heart",
  "bone_block",
  "bamboo_block",
];
// seatId -> { blockLocation?, spawnLocation, dimensionId } สำหรับ check ใน global interval
const activeSeats = new Map();

// Global interval ตรวจสอบทุก seat ในครั้งเดียว แทนการสร้าง interval ต่อ seat
function startGlobalSeatCheck() {
  if (globalSeatCheckInterval) return; // มีอยู่แล้ว
  globalSeatCheckInterval = system.runInterval(() => {
    for (const [seatId, seatData] of activeSeats) {
      const seatEntity = world.getEntity(seatId);
      if (!seatEntity) {
        activeSeats.delete(seatId);
        continue;
      }
      const dimension = world.getDimension(seatData.dimensionId);
      const blockLocation = seatData.blockLocation;
      const seatSpawnLocation = seatData.spawnLocation;

      // Check if block removed
      let isBlockRemoved = false;
      if (blockLocation) {
        const currentBlock = dimension.getBlock(blockLocation);
        isBlockRemoved =
          currentBlock.typeId === "minecraft:air" ||
          currentBlock.typeId === "minecraft:water" ||
          currentBlock.typeId === "minecraft:flowing_water" ||
          currentBlock.typeId === "minecraft:sticky_piston_arm_collision" ||
          currentBlock.typeId === "minecraft:piston_arm_collision";
      } else {
        const underSeatLocation = {
          x: Math.floor(seatEntity.location.x),
          y: Math.floor(seatEntity.location.y) - 1,
          z: Math.floor(seatEntity.location.z),
        };
        const underBlockCheck = dimension.getBlock(underSeatLocation);
        if (underBlockCheck) {
          isBlockRemoved =
            underBlockCheck.typeId === "minecraft:air" ||
            underBlockCheck.typeId === "minecraft:water" ||
            underBlockCheck.typeId === "minecraft:flowing_water" ||
            underBlockCheck.typeId ===
              "minecraft:sticky_piston_arm_collision" ||
            underBlockCheck.typeId === "minecraft:piston_arm_collision";
        } else {
          isBlockRemoved = true;
        }
      }

      // Check water
      const seatBlock = dimension.getBlock(seatEntity.location);
      const isSeatInWater =
        seatBlock.typeId === "minecraft:water" ||
        seatBlock.typeId === "minecraft:flowing_water";

      // Check movement
      const hasMoved =
        Math.floor(seatEntity.location.x * 100) / 100 !==
          Math.floor(seatSpawnLocation.x * 100) / 100 ||
        Math.floor(seatEntity.location.y * 100) / 100 !==
          Math.floor(seatSpawnLocation.y * 100) / 100 ||
        Math.floor(seatEntity.location.z * 100) / 100 !==
          Math.floor(seatSpawnLocation.z * 100) / 100;

      // Check nearby players
      const nearbyPlayers = dimension.getPlayers({
        location: seatEntity.location,
        maxDistance: 0.5,
      });

      // Remove if any condition met
      if (
        isBlockRemoved ||
        isSeatInWater ||
        hasMoved ||
        nearbyPlayers.length === 0
      ) {
        seatEntity.remove();
        activeSeats.delete(seatId);
      }
    }
    // ถ้าไม่มี seat เหลือ ให้หยุด interval
    if (activeSeats.size === 0) {
      system.clearRun(globalSeatCheckInterval);
      globalSeatCheckInterval = null;
    }
  }, 10);
}

// Set สำหรับ exact match + prefix array สำหรับ pattern matching — O(1) กว่า includes chain
const BREATHABLE_EXACT = new Set([
  "minecraft:air",
  "minecraft:frame",
  "minecraft:glow_frame",
  "minecraft:painting",
  "minecraft:banner",
]);
const BREATHABLE_PREFIX = [
  "sign",
  "gate",
  "door",
  "button",
  "torch",
  "lever",
  "rod",
  "web",
  "hanging",
  "berry",
  "carpet",
  "chain",
];
const isBreathableBlock = (typeId) =>
  BREATHABLE_EXACT.has(typeId) ||
  BREATHABLE_PREFIX.some((p) => typeId.includes(p));

// ฟังก์ชัน handle sit command (ใช้ทั้งจาก custom command และ chat command)
function handleSitCommand(player) {
  const dimension = world.getDimension(player.dimension.id);

  const velocity = player.getVelocity();
  if (Math.hypot(velocity.x, velocity.z) > 0.01) {
    player.onScreenDisplay.setActionBar("§cYou must be standing still to sit!");
    return;
  }
  if (!player.isOnGround) {
    player.onScreenDisplay.setActionBar("§cYou must be on the ground to sit!");
    return;
  }
  if (player.isCrawling) {
    player.onScreenDisplay.setActionBar("§cYou cannot sit while crawling!");
    return;
  }
  if (player.isSwimming) {
    player.onScreenDisplay.setActionBar("§cYou cannot sit while swimming!");
    return;
  }

  const underPlayerLocation = {
    x: Math.floor(player.location.x),
    y: Math.floor(player.location.y - 0.1),
    z: Math.floor(player.location.z),
  };
  const underBlock = dimension.getBlock(underPlayerLocation);
  const isUnderStairOrSlab =
    underBlock &&
    (underBlock.typeId.includes("stairs") ||
      underBlock.typeId.includes("slab"));

  let useSpecialSit = false;
  let specialSpawnY = player.location.y - 1;
  let specialRotation = { x: 0, y: player.getRotation().y };

  if (isUnderStairOrSlab) {
    const blockStates = underBlock.permutation.getAllStates();
    const isSlab = underBlock.typeId.includes("slab");
    const isStairs = underBlock.typeId.includes("stairs");
    const verticalHalf = blockStates["minecraft:vertical_half"];
    const upsideDownBit = blockStates["upside_down_bit"];
    const weirdoDirection = isStairs ? blockStates["weirdo_direction"] : null;
    let normalSeatY = Math.floor(player.location.y) - 0.5;
    if (Math.floor(player.location.y) === underPlayerLocation.y) {
      normalSeatY += 1;
    }
    if (
      !(
        (isSlab && verticalHalf === "top") ||
        (isStairs && upsideDownBit === true)
      )
    ) {
      useSpecialSit = true;
      specialSpawnY = underBlock.location.y;
      if (isStairs) {
        switch (weirdoDirection) {
          case 0:
            specialRotation = { x: 0, y: 90 };
            break;
          case 1:
            specialRotation = { x: 0, y: 270 };
            break;
          case 2:
            specialRotation = { x: 0, y: 180 };
            break;
          case 3:
            specialRotation = { x: 0, y: 0 };
            break;
        }
      }
    }
  }

  const underBlockForCarpet = dimension.getBlock({
    x: Math.floor(player.location.x),
    y: Math.floor(player.location.y),
    z: Math.floor(player.location.z),
  });

  let headroomOk = true;
  if (!useSpecialSit) {
    const groundY = Math.floor(player.location.y - 0.1);
    const blockAbove1 = dimension.getBlock({
      x: Math.floor(player.location.x),
      y: groundY + 1,
      z: Math.floor(player.location.z),
    });
    if (!isBreathableBlock(blockAbove1.typeId)) {
      headroomOk = false;
    }
  } else {
    const blockAbove1 = dimension.getBlock({
      x: Math.floor(player.location.x),
      y: Math.floor(specialSpawnY) + 1,
      z: Math.floor(player.location.z),
    });
    if (!isBreathableBlock(blockAbove1.typeId)) {
      headroomOk = false;
    }
  }

  if (!headroomOk) {
    player.onScreenDisplay.setActionBar("§7Not enough headroom to sit!");
    return;
  }

  const nearbySeatEntities = dimension.getEntities({
    type: SEAT_ENTITY_ID,
    location: player.location,
    maxDistance: 0.5,
  });
  if (nearbySeatEntities.length > 0) return;

  const seatSpawnLocation = {
    x: Math.floor(player.location.x) + 0.5,
    y: useSpecialSit ? specialSpawnY : player.location.y - 0.5,
    z: Math.floor(player.location.z) + 0.5,
  };

  system.runTimeout(() => {
    let seatRotation = useSpecialSit
      ? specialRotation
      : { x: 0, y: player.getRotation().y };

    const seat = dimension.spawnEntity(
      /** @type {any} */ (SEAT_ENTITY_ID),
      seatSpawnLocation,
    );
    seat.setRotation(seatRotation);
    seat.getComponent("rideable").addRider(player);
    // เก็บข้อมูล seat สำหรับ check ใน global interval
    activeSeats.set(seat.id, {
      spawnLocation: { ...seatSpawnLocation },
      dimensionId: dimension.id,
    });
    startGlobalSeatCheck();
  }, 5);
}

function registerCustomCommandTakeASeat(init) {
  init.customCommandRegistry.registerCommand(
    {
      name: SIT_COMMAND_NAME,
      description: "Sit down anywhere you are standing (if conditions are met)",
      permissionLevel: CommandPermissionLevel.Any,
      mandatoryParameters: [],
      cheatsRequired: false,
    },
    (origin) => {
      const player = origin.sourceEntity;

      if (!player || player.typeId !== "minecraft:player") {
        return {
          status: CustomCommandStatus.Failure,
          message: "§cThis command can only be used by players!",
        };
      }

      system.run(() => {
        handleSitCommand(player);
      });

      return {
        status: CustomCommandStatus.Success,
      };
    },
  );
}

export { registerCustomCommandTakeASeat };

function clearSeatsInDimension(dimensionName) {
  const dimension = world.getDimension(dimensionName);
  const sitEntities = dimension.getEntities({ type: SEAT_ENTITY_ID });

  for (const entity of sitEntities) {
    entity.remove();
  }
}

function chatMessage(event) {
  const message = event.message.trim().toLowerCase();
  if (message === "/sit" || message === "!sit" || message === "#sit") {
    event.cancel = true;
    system.run(() => {
      handleSitCommand(event.sender);
    });
  }
}

export { chatMessage };

const initializeScript = () => {
  console.warn("Take a Seat loaded§r - Author: xAssassin");
  system.runTimeout(() => {
    clearSeatsInDimension("overworld");
    clearSeatsInDimension("nether");
    clearSeatsInDimension("the_end");
  }, 1);
};

system.run(initializeScript);

world.beforeEvents.playerInteractWithBlock.subscribe((eventData) => {
  const player = eventData.player;
  if (player.isSneaking) return;
  const item = player
    .getComponent("minecraft:inventory")
    .container.getItem(player.selectedSlotIndex);
  const block = eventData.block;
  const blockFace = eventData.blockFace;
  const blockLocation = block.location;
  const dimension = world.getDimension(player.dimension.id);
  const playerId = player.id;
  const blockStates = block.permutation.getAllStates();
  const isSlab = block.typeId.includes("slab");
  const verticalHalf = blockStates["minecraft:vertical_half"];
  const isStairs = block.typeId.includes("stairs");
  const upsideDownBit = blockStates["upside_down_bit"];
  const weirdoDirection = isStairs ? blockStates["weirdo_direction"] : null;
  const isLog =
    block.typeId.includes("log") ||
    block.typeId.includes("crimson_stem") ||
    block.typeId.includes("wood") ||
    block.typeId.includes("bamboo_block") ||
    block.typeId.includes("hyphae") ||
    block.typeId.includes("bone_block") ||
    block.typeId.includes("creaking_heart") ||
    block.typeId.includes("warped_stem");
  const seatEntities = dimension.getEntities({
    type: SEAT_ENTITY_ID,
    location: {
      x: blockLocation.x + 0.5,
      y: blockLocation.y,
      z: blockLocation.z + 0.5,
    },
    maxDistance: 0.3,
  });
  for (const seatEntity of seatEntities) {
    const nearbyPlayers = dimension.getPlayers({
      location: seatEntity.location,
      maxDistance: 0.25,
    });
    if (nearbyPlayers.length === 0) {
      system.runTimeout(() => {
        seatEntity.remove();
      }, 1);
    }
  }
  if (block.typeId.includes("door")) return;
  if (!interactableBlockTypes.some((type) => block.typeId.includes(type)))
    return;
  if (
    (isSlab && verticalHalf === "top") ||
    (isStairs && upsideDownBit === true)
  )
    return;
  // Set สำหรับ invalid item names — O(1) lookup เร็วกว่า Array.some()
  const INVALID_ITEM_SET = new Set([
    "bricks",
    "slab",
    "chest",
    "table",
    "log",
    "block",
    "snow",
    "head",
    "skull",
    "carpet",
    "door",
    "stair",
    "chair",
    "anvil",
    "brew",
    "wall",
    "sign",
    "cracked",
    "slate",
    "gate",
    "egg",
    "bell",
    "wool",
    "glazed",
    "banner",
    "ore",
    "cobblestone",
    "stone",
    "box",
    "cake",
    "vine",
    "skulk",
    "clay",
    "cobbled",
    "copper",
    "heart",
    "crafter",
    "dispenser",
    "dropper",
    "rail",
    "lamp",
    "lectern",
    "path",
    "obsidian",
    "frame",
    "eye",
    "splash",
    "charge",
    "steel",
    "beacon",
    "furnace",
    "smoker",
    "moss",
    "pot",
    "candle",
    "boat",
    "spawn",
    "vault",
    "button",
    "torch",
    "hook",
    "tnt",
    "redstone",
    "planks",
    "fence",
    "plate",
    "stripped",
    "camp",
    "lava",
    "water",
    "ice",
    "magma",
    "coral",
    "bucket",
    "wrench",
    "debug",
    "light",
    "sand",
    "glass",
    "stem",
    "end",
    "piston",
    "wax",
    "amethyst",
    "compost",
    "dirt",
    "mud",
    "granite",
    "lever",
    "hyphae",
    "wood",
    "iron_bars",
    "leaves",
    "flower",
    "resin",
    "hive",
    "nest",
    "backpack",
    "lantern",
    "stand",
    "dummy",
    "target",
    "sea_pickle",
    "spounge",
    "andesite",
    "drip",
    "rod",
    "roots",
    "haybale",
    "pumpkin",
    "jack",
    "repeater",
    "observer",
    "comp",
    "sponge",
  ]);
  const distanceXZ = Math.sqrt(
    Math.pow(player.location.x - blockLocation.x, 2) +
      Math.pow(player.location.z - blockLocation.z, 2),
  );
  // O(1) Set lookup แทน Array.some() — เร็วกว่า 60 เท่า
  const hasInvalidItemName =
    INVALID_ITEM_SET.has(item?.typeId.split(":")[1]?.split("_")[0]) &&
    !(item?.typeId.includes("wood") && item?.hasTag("minecraft:is_tool"));
  if (!hasInvalidItemName && distanceXZ > 3) {
    system.runTimeout(() => {
      player.onScreenDisplay.setActionBar("§7Block is too far to sit on");
    }, 1);
    return;
  }
  if (hasInvalidItemName && !item?.hasTag("minecraft:is_tool")) return;
  if (item?.hasTag("xassassin:wrench")) return;
  if (isSlab && block.typeId.includes("double_slab")) return;
  if (block.typeId.includes("copper") && item?.hasTag("minecraft:is_axe"))
    return;
  if (block.typeId.includes("button")) return;
  if (isLog && item?.hasTag("minecraft:is_axe")) return;
  if (blockFace === Direction.Down) return;
  const blockAbove1 = dimension.getBlock({
    x: blockLocation.x,
    y: blockLocation.y + 1,
    z: blockLocation.z,
  });

  const blockAbove2 = isLog
    ? dimension.getBlock({
        x: blockLocation.x,
        y: blockLocation.y + 2,
        z: blockLocation.z,
      })
    : null;
  if (
    !isBreathableBlock(blockAbove1.typeId) ||
    (isLog && !isBreathableBlock(blockAbove2.typeId))
  )
    return;
  const isBlockOccupied = seatEntities.length > 0;
  if (isBlockOccupied) return;
  const playerY = Math.floor(player.location.y);
  if (blockLocation.y - playerY >= 2 || playerY - blockLocation.y >= 3) {
    system.runTimeout(() => {
      player.onScreenDisplay.setActionBar("§7Block is too far to sit on");
    }, 1);
    return;
  }
  if (!player.isOnGround) return;
  const nearbySeatEntities = dimension.getEntities({
    type: SEAT_ENTITY_ID,
    location: player.location,
    maxDistance: 0.5,
  });
  if (nearbySeatEntities.length > 0) return;
  system.runTimeout(() => {
    let seatRotation = player.getRotation();
    if (isStairs) {
      switch (weirdoDirection) {
        case 0:
          seatRotation = { x: 0, y: 90 };
          break;
        case 1:
          seatRotation = { x: 0, y: 270 };
          break;
        case 2:
          seatRotation = { x: 0, y: 180 };
          break;
        case 3:
          seatRotation = { x: 0, y: 0 };
          break;
      }
    }
    const isCarpet = block.typeId.includes("carpet");
    const seatSpawnLocation = {
      x: blockLocation.x + 0.5,
      y: isLog
        ? blockLocation.y + 0.5
        : isCarpet
          ? blockLocation.y + 0.7
          : blockLocation.y,
      z: blockLocation.z + 0.5,
    };
    const seat = dimension.spawnEntity(
      /** @type {any} */ (SEAT_ENTITY_ID),
      seatSpawnLocation,
    );
    seat.setRotation(seatRotation);
    seat.getComponent("rideable").addRider(player);
    // เก็บข้อมูล seat สำหรับ check ใน global interval
    activeSeats.set(seat.id, {
      blockLocation,
      spawnLocation: { ...seatSpawnLocation },
      dimensionId: dimension.id,
    });
    startGlobalSeatCheck();
  }, 5);
});

system.runInterval(() => {
  for (const [seatId] of activeSeats) {
    const seatEntity = world.getEntity(seatId);
    if (!seatEntity) {
      activeSeats.delete(seatId);
    }
  }
}, 100);
