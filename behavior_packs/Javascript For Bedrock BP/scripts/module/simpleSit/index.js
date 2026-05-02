import {
  CommandPermissionLevel,
  CustomCommandStatus,
  Direction,
  system,
  world,
} from "@minecraft/server";

const SEAT_ENTITY_ID = "xassassin:sit";
const SEAT_NEAR_RADIUS = 0.5;

const INTERACTABLE_BLOCK_TYPES = [
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

const INVALID_ITEM_NAMES = new Set([
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

const activeSeats = new Map();

const isBreathableBlock = (typeId) =>
  BREATHABLE_EXACT.has(typeId) ||
  BREATHABLE_PREFIX.some((p) => typeId.includes(p));

const isRemovedBlock = (typeId) =>
  typeId === "minecraft:air" ||
  typeId === "minecraft:water" ||
  typeId === "minecraft:flowing_water" ||
  typeId === "minecraft:sticky_piston_arm_collision" ||
  typeId === "minecraft:piston_arm_collision";

const weirdoToRotation = (direction) => {
  const yaw = [90, 270, 180, 0];
  return { x: 0, y: yaw[direction] ?? 0 };
};

const trunc2 = (n) => Math.floor(n * 100) / 100;

const seatHasMoved = (seat, spawnLocation) =>
  trunc2(seat.location.x) !== trunc2(spawnLocation.x) ||
  trunc2(seat.location.y) !== trunc2(spawnLocation.y) ||
  trunc2(seat.location.z) !== trunc2(spawnLocation.z);

// Global Seat Checker
function startGlobalSeatCheck() {
  if (globalSeatCheckInterval !== null) return;

  globalSeatCheckInterval = system.runInterval(() => {
    for (const [seatId, seatData] of activeSeats) {
      const seatEntity = world.getEntity(seatId);

      if (!seatEntity) {
        activeSeats.delete(seatId);
        continue;
      }

      const dimension = world.getDimension(seatData.dimensionId);

      let isBlockRemoved = false;
      if (seatData.blockLocation) {
        const block = dimension.getBlock(seatData.blockLocation);
        isBlockRemoved = isRemovedBlock(block.typeId);
      } else {
        const underLocation = {
          x: Math.floor(seatEntity.location.x),
          y: Math.floor(seatEntity.location.y) - 1,
          z: Math.floor(seatEntity.location.z),
        };
        const underBlock = dimension.getBlock(underLocation);
        isBlockRemoved = underBlock ? isRemovedBlock(underBlock.typeId) : true;
      }

      const seatBlock = dimension.getBlock(seatEntity.location);
      const isSeatInWater =
        seatBlock.typeId === "minecraft:water" ||
        seatBlock.typeId === "minecraft:flowing_water";

      const hasMoved = seatHasMoved(seatEntity, seatData.spawnLocation);

      const hasRider =
        dimension.getPlayers({
          location: seatEntity.location,
          maxDistance: SEAT_NEAR_RADIUS,
        }).length > 0;

      if (isBlockRemoved || isSeatInWater || hasMoved || !hasRider) {
        seatEntity.remove();
        activeSeats.delete(seatId);
      }
    }

    if (activeSeats.size === 0) {
      system.clearRun(globalSeatCheckInterval);
      globalSeatCheckInterval = null;
    }
  }, 10);
}

// Seat Spawning
function registerSeat(seat, spawnLocation, dimensionId, blockLocation) {
  activeSeats.set(seat.id, {
    ...(blockLocation && { blockLocation }),
    spawnLocation: { ...spawnLocation },
    dimensionId,
  });
  startGlobalSeatCheck();
}

function spawnSeat(dimension, spawnLocation, rotation, player, blockLocation) {
  system.runTimeout(() => {
    const seat = dimension.spawnEntity(
      /** @type {any} */ (SEAT_ENTITY_ID),
      spawnLocation,
    );
    seat.setRotation(rotation);
    seat.getComponent("rideable").addRider(player);
    registerSeat(seat, spawnLocation, dimension.id, blockLocation);
  }, 5);
}

// Sit Command Logic
function handleSitCommand(player) {
  const dimension = world.getDimension(player.dimension.id);
  const { x: px, y: py, z: pz } = player.location;

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

  // Inspect block under player
  const underLocation = {
    x: Math.floor(px),
    y: Math.floor(py - 0.1),
    z: Math.floor(pz),
  };
  const underBlock = dimension.getBlock(underLocation);
  const isSlab = underBlock?.typeId.includes("slab");
  const isStairs = underBlock?.typeId.includes("stairs");
  const isUnderStairOrSlab = underBlock && (isSlab || isStairs);

  let useSpecialSit = false;
  let specialSpawnY = py - 1;
  let specialRotation = { x: 0, y: player.getRotation().y };

  if (isUnderStairOrSlab) {
    const blockStates = underBlock.permutation.getAllStates();
    const verticalHalf = blockStates["minecraft:vertical_half"];
    const upsideDownBit = blockStates["upside_down_bit"];
    const weirdoDirection = isStairs ? blockStates["weirdo_direction"] : null;

    const isFlipped =
      (isSlab && verticalHalf === "top") ||
      (isStairs && upsideDownBit === true);

    if (!isFlipped) {
      useSpecialSit = true;
      specialSpawnY = underBlock.location.y;
      if (isStairs) {
        specialRotation = weirdoToRotation(weirdoDirection);
      }
    }
  }

  // Headroom check
  const headCheckY = useSpecialSit
    ? Math.floor(specialSpawnY) + 1
    : Math.floor(py - 0.1) + 1;
  const blockAboveHead = dimension.getBlock({
    x: Math.floor(px),
    y: headCheckY,
    z: Math.floor(pz),
  });
  if (!isBreathableBlock(blockAboveHead.typeId)) {
    player.onScreenDisplay.setActionBar("§7Not enough headroom to sit!");
    return;
  }

  // No seat already here
  const nearbySeat = dimension.getEntities({
    type: SEAT_ENTITY_ID,
    location: player.location,
    maxDistance: SEAT_NEAR_RADIUS,
  });
  if (nearbySeat.length > 0) return;

  const spawnLocation = {
    x: Math.floor(px) + 0.5,
    y: useSpecialSit ? specialSpawnY : py - 0.5,
    z: Math.floor(pz) + 0.5,
  };
  const rotation = useSpecialSit
    ? specialRotation
    : { x: 0, y: player.getRotation().y };

  spawnSeat(dimension, spawnLocation, rotation, player, undefined);
}

// Custom Command Registration
function registerCustomCommandTakeASeat(init) {
  init.customCommandRegistry.registerCommand(
    {
      name: "addon:sit",
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

      system.run(() => handleSitCommand(player));
      return { status: CustomCommandStatus.Success };
    },
  );
}

// Chat Command
const SIT_CHAT_TRIGGERS = new Set(["/sit", "!sit", "#sit"]);
function chatMessage(event) {
  if (!SIT_CHAT_TRIGGERS.has(event.message.trim().toLowerCase())) return;
  event.cancel = true;
  system.run(() => handleSitCommand(event.sender));
}

// Block Interact: Sit on Stairs / Slabs / Logs (world.beforeEvents.playerInteractWithBlock.subscribe((eventData))
function handleWithBlock(eventData) {
  const { player, block, blockFace } = eventData;
  if (player.isSneaking) return;
  if (!INTERACTABLE_BLOCK_TYPES.some((type) => block.typeId.includes(type)))
    return;
  if (block.typeId.includes("door")) return;
  if (blockFace === Direction.Down) return;

  const blockStates = block.permutation.getAllStates();
  const isSlab = block.typeId.includes("slab");
  const isStairs = block.typeId.includes("stairs");
  const isCarpet = block.typeId.includes("carpet");
  const isLog =
    block.typeId.includes("log") ||
    block.typeId.includes("crimson_stem") ||
    block.typeId.includes("wood") ||
    block.typeId.includes("bamboo_block") ||
    block.typeId.includes("hyphae") ||
    block.typeId.includes("bone_block") ||
    block.typeId.includes("creaking_heart") ||
    block.typeId.includes("warped_stem");

  const verticalHalf = blockStates["minecraft:vertical_half"];
  const upsideDownBit = blockStates["upside_down_bit"];
  const weirdoDirection = isStairs ? blockStates["weirdo_direction"] : null;

  // Skip flipped slabs / upside-down stairs
  if (
    (isSlab && verticalHalf === "top") ||
    (isStairs && upsideDownBit === true)
  )
    return;
  if (isSlab && block.typeId.includes("double_slab")) return;

  const { location: blockLocation } = block;
  const dimension = world.getDimension(player.dimension.id);

  // Clean up orphaned seat entities on this block
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
    const riders = dimension.getPlayers({
      location: seatEntity.location,
      maxDistance: 0.25,
    });
    if (riders.length === 0) {
      system.runTimeout(() => seatEntity.remove(), 1);
    }
  }

  if (seatEntities.length > 0) return; // Block already occupied

  // Held-item check
  const item = player
    .getComponent("minecraft:inventory")
    .container.getItem(player.selectedSlotIndex);

  const itemName = item?.typeId.split(":")[1]?.split("_")[0];
  const hasInvalidItem =
    INVALID_ITEM_NAMES.has(itemName) &&
    !(item?.typeId.includes("wood") && item?.hasTag("minecraft:is_tool"));

  if (hasInvalidItem && !item?.hasTag("minecraft:is_tool")) return;
  if (item?.hasTag("xassassin:wrench")) return;
  if (block.typeId.includes("copper") && item?.hasTag("minecraft:is_axe"))
    return;
  if (isLog && item?.hasTag("minecraft:is_axe")) return;

  // Distance checks
  const distXZ = Math.hypot(
    player.location.x - blockLocation.x,
    player.location.z - blockLocation.z,
  );
  if (!hasInvalidItem && distXZ > 3) {
    system.runTimeout(() => {
      player.onScreenDisplay.setActionBar("§7Block is too far to sit on");
    }, 1);
    return;
  }

  const playerY = Math.floor(player.location.y);
  const yDiff = blockLocation.y - playerY;
  if (yDiff >= 2 || playerY - blockLocation.y >= 3) {
    system.runTimeout(() => {
      player.onScreenDisplay.setActionBar("§7Block is too far to sit on");
    }, 1);
    return;
  }

  // Headroom check
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

  if (!isBreathableBlock(blockAbove1.typeId)) return;
  if (isLog && blockAbove2 && !isBreathableBlock(blockAbove2.typeId)) return;

  // Player must be grounded and not already seated
  if (!player.isOnGround) return;
  const nearbySeats = dimension.getEntities({
    type: SEAT_ENTITY_ID,
    location: player.location,
    maxDistance: SEAT_NEAR_RADIUS,
  });
  if (nearbySeats.length > 0) return;

  const spawnLocation = {
    x: blockLocation.x + 0.5,
    y: isLog
      ? blockLocation.y + 0.5
      : isCarpet
        ? blockLocation.y + 0.7
        : blockLocation.y,
    z: blockLocation.z + 0.5,
  };
  const rotation = isStairs
    ? weirdoToRotation(weirdoDirection)
    : player.getRotation();

  spawnSeat(dimension, spawnLocation, rotation, player, blockLocation);
}

// Initialization
function clearSeatsInDimension(dimensionName) {
  const dimension = world.getDimension(dimensionName);
  for (const entity of dimension.getEntities({ type: SEAT_ENTITY_ID })) {
    entity.remove();
  }
}

system.run(() => {
  system.runTimeout(() => {
    clearSeatsInDimension("overworld");
    clearSeatsInDimension("nether");
    clearSeatsInDimension("the_end");
  }, 1);
});

// Periodic stale-entry cleanup (safety net for externally removed entities)
function handleSit() {
  for (const [seatId] of activeSeats) {
    if (!world.getEntity(seatId)) {
      activeSeats.delete(seatId);
    }
  }
}

export {
  handleSit,
  chatMessage,
  registerCustomCommandTakeASeat,
  handleWithBlock,
};
