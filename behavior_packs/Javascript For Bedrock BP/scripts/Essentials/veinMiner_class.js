import { world, system, ItemStack, Player, Block } from "@minecraft/server";
import { Module, moduleManager } from "../mainCore.js";

class VeinMinerModule extends Module {
    constructor() {
        super(
            "Vein Miner",
            "Mines entire veins of ore at once while sneaking.",
            "Hold sneak to mine a single block. Tool durability is applied for each block.",
            true, // isHeavy
            "textures/items/iron_pickaxe.png",
        );

        this.settings = {
            maxBlocks: {
                type: "slider",
                label: "Max Blocks to Mine",
                min: 2,
                max: 128,
                step: 1,
                tooltip: "The maximum number of blocks to mine in a single vein.",
            },
            delay: {
                type: "slider",
                label: "Delay Between Blocks (ticks)",
                min: 0,
                max: 10,
                step: 1,
                tooltip: "The delay in ticks between mining each block.",
            },
            enableDurability: {
                type: "toggle",
                label: "Enable Durability Loss",
                tooltip: "If enabled, the tool used will take durability damage for each block mined.",
            },
        };

        this.maxBlocks = 16; // Default value
        this.delay = 1; // Default value
        this.enableDurability = true;
        this.breakPriority = 10;
    }

    onPlayerBreak(event) {
        const { player, block } = event;

        if (!player.isSneaking) return;
        if (!block.typeId.includes("ore") && !block.typeId.includes("ancient_debris")) return;

        const itemStack = player.getComponent("inventory").container.getItem(player.selectedSlotIndex);
        if (!itemStack || !itemStack.hasTag("minecraft:is_pickaxe")) return;

        if (player.hasTag("vein_mining")) return;
        event.cancel = true;
        event.handled = true;
        system.run(() => this.startVeinMine(player, block));
    }
    /**
     * 
     * @param {Player} player 
     * @param {Block} startBlock 
     */
    async startVeinMine(player, startBlock) {
        player.addTag("vein_mining");
        try {
            const blocksToBreak = this.findVein(startBlock, this.maxBlocks);
            const inv = player.getComponent("inventory").container;
            const autoSmeltModule = moduleManager.modules.get("Auto Smelt");
            const autoPickupModule = moduleManager.modules.get("AutoPickup");
            const isAutoSmeltEnabled = autoSmeltModule?.isEnabled;
            const isAutoPickupEnabled = autoPickupModule?.isEnabled;
            const dimension = player.dimension;
            for (const block of blocksToBreak) {
                let filteredBlockId = block.typeId.replace("minecraft:", "");
                const mainHandItem = inv.getItem(player.selectedSlotIndex);
                if (!mainHandItem || !mainHandItem.hasTag("minecraft:is_pickaxe")) break;

                // Apply durability damage for every block broken
                if (this.enableDurability && mainHandItem.getComponent("durability")) {
                    CTsAPI.utils.increaseDurability(player, mainHandItem, 1);
                }

                const enchantments = mainHandItem.getComponent("enchantable");
                const hasSilkTouch = enchantments.hasEnchantment("silk_touch");
                const fortuneEnchant = enchantments.hasEnchantment("fortune") ? enchantments.getEnchantment("fortune") : null;
                const fortuneLevel = fortuneEnchant ? fortuneEnchant.level : 0;

                const blockCenter = block.center();
                const lootItems = world.getLootTableManager().generateLootFromBlock(block, mainHandItem);
                if (!lootItems) continue;
                world.gameRules.doTileDrops = false;
                dimension.runCommand(`setblock ${block.location.x} ${block.location.y} ${block.location.z} air destroy`);
                let didSmeltSomething = false;
                const shouldTrySmelting = isAutoSmeltEnabled && !hasSilkTouch && !(fortuneLevel > 0 && autoSmeltModule.prioritizeFortune);

                let finalLoot = [];
                if (shouldTrySmelting && autoSmeltModule) {
                    for (const item of lootItems) {
                        const smeltedResultId = autoSmeltModule.smeltMap.get(item.typeId);
                        if (smeltedResultId) {
                            finalLoot.push(new ItemStack(smeltedResultId, item.amount));
                            didSmeltSomething = true;
                        } else {
                            finalLoot.push(item);
                        }
                    }
                } else {
                    finalLoot = lootItems;
                }
                if (!hasSilkTouch) {
                    let xpAmount = autoPickupModule.xpList[filteredBlockId] || [0, 0];
                    if (xpAmount[0] > 0 || xpAmount[1] > 0) {
                        const xpToDrop = Math.floor(Math.random() * (xpAmount[1] - xpAmount[0] + 1)) + xpAmount[0];
                        if (xpToDrop > 0) {
                            for (let i = 0; i < xpToDrop; i++) {
                                dimension.spawnEntity("minecraft:xp_orb", blockCenter);
                            }
                        }
                    }
                }
                for (const item of finalLoot) {
                    if (isAutoPickupEnabled) {
                        CTsAPI.utils.addItem(player, item);
                    } else {
                        dimension.spawnItem(item, blockCenter);
                    }
                }

                if (didSmeltSomething && autoSmeltModule) {
                    dimension.spawnParticle("minecraft:basic_flame_particle", blockCenter);
                    const xpToGive = autoSmeltModule.xpMap.get(block.typeId?.replace("lit_", "").replace("deepslate_", "")) || 0;
                    if (xpToGive > 0) player.addExperience(xpToGive);
                }

                await CTsAPI.utils.delay(this.delay);
                world.gameRules.doTileDrops = true;
            }
        } catch (e) {
            console.warn(`[VeinMiner] An error occurred: ${e.stack || e}`);
        } finally {
            player.removeTag("vein_mining");
        }
    }

    findVein(startBlock, limit) {
        const blockType = startBlock.typeId;
        const dimension = startBlock.dimension;
        const foundBlocks = [];
        const queue = [startBlock];
        const visited = new Set([CTsAPI.utils.locationToString(startBlock.location)]);

        while (queue.length > 0 && foundBlocks.length < limit) {
            const currentBlock = queue.shift();
            foundBlocks.push(currentBlock);

            for (let x = -1; x <= 1; x++)
                for (let y = -1; y <= 1; y++)
                    for (let z = -1; z <= 1; z++) {
                        if (x === 0 && y === 0 && z === 0) continue;
                        const neighborLocation = { x: currentBlock.location.x + x, y: currentBlock.location.y + y, z: currentBlock.location.z + z };
                        const locString = CTsAPI.utils.locationToString(neighborLocation);
                        if (visited.has(locString)) continue;
                        visited.add(locString);
                        try {
                            if (dimension.getBlock(neighborLocation)?.typeId?.replace("lit_", "") === blockType?.replace("lit_", ""))
                                queue.push(dimension.getBlock(neighborLocation));
                        } catch (e) { }
                    }
        }
        return foundBlocks;
    }
}

moduleManager.registerModule(new VeinMinerModule());
