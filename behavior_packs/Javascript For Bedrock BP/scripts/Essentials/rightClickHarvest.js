import { world, system, PlayerInteractWithBlockBeforeEvent, ItemStack } from "@minecraft/server";
import { Module, moduleManager } from "../mainCore.js";

class RightClickHarvestModule extends Module {
    constructor() {
        super(
            "Right-Click Harvest",
            "Harvests and replants crops with a right-click.",
            "Harvests fully grown crops without breaking them. Does not require an extra seed.",
            false,
            "textures/blocks/wheat_stage_7.png",
        );

        this.cropData = new Map([
            ["minecraft:wheat", { loot: "minecraft:wheat", seeds: "minecraft:wheat_seeds", growthProperty: "growth", maxGrowth: 7 }],
            ["minecraft:potatoes", { loot: "minecraft:potato", seeds: "minecraft:potato", growthProperty: "growth", maxGrowth: 7 }],
            ["minecraft:carrots", { loot: "minecraft:carrot", seeds: "minecraft:carrot", growthProperty: "growth", maxGrowth: 7 }],
            ["minecraft:beetroot", { loot: "minecraft:beetroot", seeds: "minecraft:beetroot_seeds", growthProperty: "growth", maxGrowth: 7 }],
            ["minecraft:nether_wart", { loot: "minecraft:nether_wart", seeds: "minecraft:nether_wart", growthProperty: "age", maxGrowth: 3, soil: "minecraft:soul_sand" }],
        ]);

        this.interactPriority = 10;
    }

    /**
     * @param {PlayerInteractWithBlockBeforeEvent} event
     */
    onPlayerInteract(event) {
        const { player, block, isFirstEvent } = event;
        if (!isFirstEvent) return;
        const cropInfo = this.cropData.get(block.type.id);

        if (!cropInfo) return;

        const growthState = block.permutation.getState(cropInfo.growthProperty);
        if (growthState !== cropInfo.maxGrowth) return;

        event.cancel = true;
        event.handled = true;
        system.run(() => {
            const dimension = block.dimension;
            const location = block.center();
            const autoPickupModule = moduleManager.modules.get("AutoPickup");
            const isAutoPickupEnabled = autoPickupModule?.isEnabled;

            const lootManager = world.getLootTableManager?.();
            let drops;

            if (lootManager?.generateLootFromBlockPermutation) {
                drops = lootManager.generateLootFromBlockPermutation(block.permutation);
            }

            if (Array.isArray(drops) && drops.length) {
                for (const stack of drops) {
                    if (stack && stack.amount > 0) {
                        if (isAutoPickupEnabled) {
                            CTsAPI.utils.addItem(player, stack);
                        } else {
                            dimension.spawnItem(stack, location);
                        }
                    }
                }
            }

            block.setPermutation(block.permutation.withState(cropInfo.growthProperty, 0));
            dimension.playSound("dig.grass", location, { volume: 0.5 });
        });
    }
}

moduleManager.registerModule(new RightClickHarvestModule());
