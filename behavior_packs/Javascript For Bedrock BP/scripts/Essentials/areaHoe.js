import {
  world,
  system,
  PlayerInteractWithBlockBeforeEvent,
} from "@minecraft/server";
import { Module, moduleManager } from "../mainCore.js";

class AreaHoeModule extends Module {
  constructor() {
    super(
      "Area Hoe",
      "Tills a 3x3 area of dirt with one use of a hoe.",
      "Saves time when creating large farms. Consumes durability for each block tilled.",
      false,
      "textures/items/wood_hoe.png",
    );
    this.isEnabled = false;
    this.settings = {
      areaSize: {
        type: "dropdown",
        label: "Area Size",
        options: ["3x3", "5x5", "7x7"],
        tooltip: "The size of the area tilled when using the hoe.",
      },
      enableDurability: {
        type: "toggle",
        label: "Enable Durability Loss",
        tooltip:
          "If enabled, the hoe used will take durability damage for each block tilled.",
      },
    };

    this.areaSize = 0; // 0 = 3x3, 1 = 5x5, 2 = 7x7
    this.enableDurability = true;
    this.interactPriority = 10; // Higher priority to run before other modules that interact with blocks

    this.validBlocks = new Set([
      "minecraft:dirt",
      "minecraft:grass_block",
      "minecraft:coarse_dirt",
      "minecraft:rooted_dirt",
      "minecraft:dirt_with_roots",
    ]);
  }

  /**
   * @param {PlayerInteractWithBlockBeforeEvent} event
   */
  onPlayerInteract(event) {
    if (!this.isEnabled) return;

    const { player, itemStack, block } = event;
    if (!itemStack?.hasTag("minecraft:is_hoe")) return;
    if (!this.validBlocks.has(block.typeId)) return;

    event.cancel = true;
    event.handled = true;

    system.run(() => {
      const dimension = player.dimension;
      const center = block.location;

      const halfSize = Math.floor((this.areaSize * 2 + 3) / 2);
      for (let x = -halfSize; x <= halfSize; x++) {
        for (let z = -halfSize; z <= halfSize; z++) {
          const hoe = player
            .getComponent("inventory")
            .container.getItem(player.selectedSlotIndex);
          if (!hoe || !hoe.hasTag("minecraft:is_hoe")) break;

          const currentLoc = CTsAPI.vector.add(center, { x: x, y: 0, z: z });
          const currentBlock = dimension.getBlock(currentLoc);

          if (
            currentBlock &&
            this.validBlocks.has(currentBlock.typeId) &&
            currentBlock.above(1).isAir
          ) {
            currentBlock.setType("minecraft:farmland");
            if (this.enableDurability && hoe.getComponent("durability"))
              CTsAPI.utils.increaseDurability(player, hoe, 1);
          }
        }
      }
      dimension.playSound("item.hoe.till", center, { volume: 1, pitch: 0.8 });
    });
  }
}

moduleManager.registerModule(new AreaHoeModule());
