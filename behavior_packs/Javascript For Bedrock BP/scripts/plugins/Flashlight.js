import {
  world,
  system,
  EquipmentSlot,
  ItemStack,
  BlockPermutation,
  CommandPermissionLevel,
  CustomCommandParamType,
} from "@minecraft/server";

import { isTree, breakTree } from "./treeCapitator.js";
import { isOreVein, breakOreVein, pickaxeBreaks } from "./veinMiner.js";

system.beforeEvents.startup.subscribe((event) => {
  event.customCommandRegistry.registerEnum("addon:enum", ["enable", "disable"]);

  event.customCommandRegistry.registerCommand(
    {
      name: "addon:pickup",
      description: "Enable or Disable Auto-Pickup",
      permissionLevel: CommandPermissionLevel.Any,
      mandatoryParameters: [
        { name: "addon:enum", type: CustomCommandParamType.Enum },
      ],
    },
    (origin, ans) => {
      const player = origin.sourceEntity;
      if (player.typeId !== "minecraft:player") return { success: false };
      const playerObj = /** @type {import("@minecraft/server").Player} */ (
        player
      );
      switch (ans) {
        case "enable":
          playerObj.sendMessage("§aAuto Pickup has now been enabled");
          system.run(() => {
            playerObj.addTag("gao:pickup");
          });
          break;

        case "disable":
          playerObj.sendMessage("§cAuto Pickup has now been disabled");
          system.run(() => {
            playerObj.removeTag("gao:pickup");
          });
          break;

        default:
          break;
      }
      return { success: true };
    },
  );
});

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

  if (player.hasTag("gao:pickup")) {
    const items = block.dimension.getEntitiesAtBlockLocation(block.location);
    let itemStack = [];
    for (const item of items) {
      if (item.typeId == "minecraft:item") {
        itemStack.push(item);
      }
    }
    if (!itemStack) return;
    const inv = player.getComponent("inventory").container;
    if (inv.emptySlotsCount < 1) return;

    for (const item of itemStack) {
      const realItem = item.getComponent("item").itemStack;
      inv.addItem(realItem);
      item.kill();
    }
  }

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

  // const direction = block.permutation.getState("facing_direction");

  // if (!itemStack && direction>=0 && player.isSneaking) {
  //     event.cancel = true;
  //     const newDir = directionNumber(blockFace)
  //     system.run(() => {
  //         const perm = block.permutation.withState("facing_direction", newDir);
  //         block.setPermutation(perm)
  //     })
  // }

  // Anvil Repair
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

const previousLights = new Map();
const water = new Map();

system.runInterval(() => {
  for (const player of world.getAllPlayers()) {
    const tag =
      player.getTags().find((tag) => tag.startsWith("gao:loc:::")) ?? 0;

    if (player.getComponent("health").currentValue > 0 && tag != 0) {
      const location = JSON.parse(tag.slice(10));
      player.sendMessage(
        `You died at ${Math.floor(location.x)} ${Math.floor(location.y)} ${Math.floor(location.z)}`,
      );
      player.removeTag(tag);
    }
    //Flashlight

    const heldItem = player
      .getComponent("inventory")
      .container.getItem(player.selectedSlotIndex);
    const offhandItem = player
      .getComponent("equippable")
      .getEquipment(EquipmentSlot.Offhand);

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

      for (let i = 1; i <= 24; i++) {
        const block = getBlockFromView(player, headLoc, viewDir, i);
        if (
          (block && block.typeId === "minecraft:air") ||
          (block && block.typeId === "minecraft:light_block_7")
        ) {
          block.setType("minecraft:light_block_7");
          newLightPositions.push(block.location);
        }
      }

      previousLights.set(player.id, newLightPositions);
    } else {
      previousLights.delete(player.id);
    }

    // Easy Sponge

    if (heldItem?.typeId === "minecraft:sponge") {
      const headLoc = player.getHeadLocation();
      const viewDir = player.getViewDirection();
      const block = getBlockFromView(player, headLoc, viewDir, 5);
      const blockLoc = block.location;
      water.set(player.id, blockLoc);
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
    const loc = water.get(source.id);
    const blockAtLoc = source.dimension.getBlock(loc);

    if (blockAtLoc.typeId === "minecraft:water") {
      blockAtLoc.setType(itemStack.typeId);
    }
  }
});

export function getBlockFromView(player, location, view, distance) {
  const viewDistance = {
    x: view.x * distance,
    y: view.y * distance,
    z: view.z * distance,
  };

  const blockLocation = {
    x: Math.floor(viewDistance.x + location.x),
    y: Math.floor(viewDistance.y + location.y),
    z: Math.floor(viewDistance.z + location.z),
  };

  return player.dimension.getBlock(blockLocation);
}

function directionNumber(direction) {
  switch (direction) {
    case "Down":
      return 0;
    case "Up":
      return 1;
    case "North":
      return 2;
    case "South":
      return 3;
    case "West":
      return 4;
    case "East":
      return 5;
    default:
      return -1;
  }
}

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
