import {
  world,
  system,
  EquipmentSlot,
  ItemStack,
  BlockPermutation,
} from "@minecraft/server";

import { isTree, breakTree } from "./treeCapitator.js";
import { isOreVein, breakOreVein, pickaxeBreaks } from "./veinMiner.js";


world.beforeEvents.playerBreakBlock.subscribe((event) => {
  const { player, block, itemStack } = event;

  // Tre Capitator
  if (
    player.isSneaking &&
    itemStack?.typeId.includes("axe") &&
    !itemStack?.typeId.includes("pick") &&
    isTree(block)
  ) {
    breakTree(block);
  }

  //Vein  Miner
  if (
    player.isSneaking &&
    Object.keys(pickaxeBreaks).includes(itemStack?.typeId) &&
    isOreVein(block)
  ) {
    breakOreVein(block, itemStack);
  }
});

world.afterEvents.playerBreakBlock.subscribe((event) => {
  const { brokenBlockPermutation, block, player } = event;
  const blockId = brokenBlockPermutation.type.id;



  // Auto Replant
  if (blockId in cropConfigs) {
    const crop = cropConfigs[blockId];
    const growth = brokenBlockPermutation.getState(crop.state);

    if (growth >= 7) {
      const loc = block.location;
      const dim = player.dimension;

      dim
        .getBlock(loc)
        .setPermutation(
          BlockPermutation.resolve(blockId).withState(crop.state, 0),
        );
    }
  }
});

world.afterEvents.playerInteractWithBlock.subscribe((event) => {
  const { block } = event;

  // Open Double Doors (click low door)
  if (block.typeId.includes("door") && !block.typeId.includes("trap")) {
    const neighbors = [
      block.east(),
      block.west(),
      block.north(),
      block.south(),
    ];

    const direction = block.permutation.getState(
      "minecraft:cardinal_direction",
    );
    const open_bit = block.permutation.getState("open_bit");

    for (const door of neighbors) {
      if (door.typeId.includes("door") && !door.typeId.includes("trap")) {
        const direction2 = door.permutation.getState(
          "minecraft:cardinal_direction",
        );

        if (direction === direction2) {
          const perm = door.permutation.withState("open_bit", open_bit);
          door.setPermutation(perm);
        }
      }
    }
  }
});

world.beforeEvents.playerInteractWithBlock.subscribe((event) => {
  const { block, blockFace, itemStack, player } = event;

  const direction = block.permutation.getState("facing_direction");

  if (!itemStack && direction >= 0 && player.isSneaking) {
    event.cancel = true;
    const newDir = directionNumber(blockFace)
    system.run(() => {
      const perm = block.permutation.withState("facing_direction", newDir);
      block.setPermutation(perm)
    })
  }


  if (
    block.typeId.includes("anvil") &&
    block.typeId !== "minecraft:anvil" &&
    itemStack?.typeId === "minecraft:iron_ingot" &&
    !player.isSneaking
  ) {
    event.cancel = true;
    const amount = itemStack.amount;
    const heldItem = player.getComponent("inventory").container;

    system.run(() => {
      const states = block.permutation.getAllStates();
      const condition = states["damage"];
      if (condition == "very_damaged") {
        states["damage"] = "slightly_damaged";
      } else if (condition == "slightly_damaged") {
        states["damage"] = "undamaged";
      }

      const perm = BlockPermutation.resolve(block.typeId, states);
      block.setPermutation(perm);

      if (amount > 1) {
        heldItem.setItem(
          player.selectedSlotIndex,
          new ItemStack(itemStack.typeId, amount - 1),
        );
      } else {
        heldItem.setItem(player.selectedSlotIndex, undefined);
      }
    });
  }
});

world.afterEvents.entityDie.subscribe((event) => {
  const { deadEntity } = event;
  if (deadEntity.typeId != "minecraft:player") return;

  deadEntity.addTag(`gao:loc:::${JSON.stringify(deadEntity.location)}`);
});

world.afterEvents.playerSpawn.subscribe((event) => {
  if (event.initialSpawn) return;
  const player = event.player;
  const tag = player.getTags().find((tag) => tag.startsWith("gao:loc:::"));
  if (tag) {
    const location = JSON.parse(tag.slice(10));
    player.sendMessage(
      `You died at ${Math.floor(location.x)} ${Math.floor(location.y)} ${Math.floor(location.z)}`,
    );
    player.removeTag(tag);
  }
});

const previousLights = new Map();

system.runInterval(() => {
  for (const player of world.getAllPlayers()) {
    const equippable = player.getComponent("equippable");
    if (!equippable) continue;

    const heldItem = equippable.getEquipment(EquipmentSlot.Mainhand);
    const offhandItem = equippable.getEquipment(EquipmentSlot.Offhand);

    const oldBlocks = previousLights.get(player.id);
    if (oldBlocks) {
      for (const loc of oldBlocks) {
        const block = player.dimension.getBlock(loc);
        if (block?.typeId === "minecraft:light_block_7") {
          block.setType("minecraft:air");
        }
      }
    }

    if (
      heldItem?.typeId === "gao:flashlight" ||
      offhandItem?.typeId === "gao:flashlight"
    ) {
      const headLoc = player.getHeadLocation();
      const viewDir = player.getViewDirection();
      const newLightPositions = [];
      let lastX, lastY, lastZ;

      for (let i = 1; i <= 24; i++) {
        const x = Math.floor(headLoc.x + viewDir.x * i);
        const y = Math.floor(headLoc.y + viewDir.y * i);
        const z = Math.floor(headLoc.z + viewDir.z * i);

        if (x === lastX && y === lastY && z === lastZ) continue;
        lastX = x; lastY = y; lastZ = z;

        const loc = { x, y, z };
        const block = player.dimension.getBlock(loc);
        if (
          block &&
          (block.typeId === "minecraft:air" || block.typeId === "minecraft:light_block_7")
        ) {
          block.setType("minecraft:light_block_7");
          newLightPositions.push(loc);
        }
      }

      previousLights.set(player.id, newLightPositions);
    } else {
      previousLights.delete(player.id);
    }
  }
}, 1);

world.afterEvents.playerLeave.subscribe((event) => {
  const playerId = event.playerId;
  const oldBlocks = previousLights.get(playerId);

  if (oldBlocks) {
    for (const loc of oldBlocks) {
      const dim = world.getDimension("overworld");
      const block = dim.getBlock(loc);
      if (block?.typeId === "minecraft:light_block_7") {
        block.setType("minecraft:air");
      }
    }
    previousLights.delete(playerId);
  }
});

world.afterEvents.itemUse.subscribe((event) => {
  const { source, itemStack } = event;

  if (itemStack.typeId == "minecraft:sponge") {
    const headLoc = source.getHeadLocation();
    const viewDir = source.getViewDirection();
    const blockAtLoc = getBlockFromView(source, headLoc, viewDir, 5);

    if (blockAtLoc?.typeId === "minecraft:water") {
      blockAtLoc.setType(itemStack.typeId);
    }
  }
});

export const getBlockFromView = (player, location, view, distance) => {
  return player.dimension.getBlock({
    x: Math.floor((view.x * distance) + location.x),
    y: Math.floor((view.y * distance) + location.y),
    z: Math.floor((view.z * distance) + location.z),
  });
};

const DIRS = { Down: 0, Up: 1, North: 2, South: 3, West: 4, East: 5 };
const directionNumber = (direction) => DIRS[direction] ?? -1;

const cropConfigs = {
  "minecraft:wheat": {
    seed: "minecraft:wheat_seeds",
    state: "growth",
  },
  "minecraft:carrots": {
    seed: "minecraft:carrot",
    state: "growth",
  },
  "minecraft:potatoes": {
    seed: "minecraft:potato",
    state: "growth",
  },
  "minecraft:beetroot": {
    seed: "minecraft:beetroot_seeds",
    state: "growth",
  },
};
