import {
  CommandPermissionLevel,
  CustomCommandStatus,
  system,
  world,
} from "@minecraft/server";

const SEAT_ENTITY_ID = "xassassin:sit";
const SEAT_NEAR_RADIUS = 0.5;

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

const activeSeats = new Map();

let globalSeatCheckInterval = null;

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
    const seat = dimension.spawnEntity(spawnLocation);
    seat.setRotation(rotation);
    seat.getComponent("rideable").addRider(player);
    registerSeat(seat, spawnLocation, dimension.id, blockLocation);
  }, 5);
}

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

export { registerCustomCommandTakeASeat };
