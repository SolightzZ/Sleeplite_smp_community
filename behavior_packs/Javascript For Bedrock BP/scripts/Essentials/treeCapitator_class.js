import { world, system, Player, Block } from "@minecraft/server";
import { Module, moduleManager } from "../mainCore.js";

class TreeCapitatorModule extends Module {
    constructor() {
        super(
            "Tree Capitator",
            "Chops down entire trees at once when sneaking.",
            "Hold sneak to chop a single log. Also accelerates leaf decay.",
            true,
            "textures/items/iron_axe.png",
        );

        this.settings = {
            maxBlocks: {
                type: "slider",
                label: "Max Logs to Chop",
                min: 2,
                max: 1024,
                step: 1,
                tooltip: "The maximum number of logs to chop from a single tree.",
            },
            delay: {
                type: "slider",
                label: "Delay Between Logs (ticks)",
                min: 0,
                max: 10,
                step: 1,
                tooltip: "The delay in ticks between chopping each log.",
            },
            fastLeafDecay: {
                type: "toggle",
                label: "Fast Leaf Decay",
                tooltip: "If enabled, leaves from chopped trees will decay quickly.",
            },
            replanter: {
                type: "toggle",
                label: "Replanter",
                tooltip: "Automatically replants a sapling after chopping down a tree. Requires a sapling in the inventory and suitable ground.",
            },
            enableDurability: {
                type: "toggle",
                label: "Enable Durability Loss",
                tooltip: "If enabled, the axe used will take durability damage for each log chopped.",
            },
        };

        this.maxBlocks = 32;
        this.delay = 1;
        this.fastLeafDecay = true;
        this.enableDurability = true;
        this.replanter = false;

        this.logToSaplingMap = new Map([
            ["oak", "minecraft:oak_sapling"],
            ["spruce", "minecraft:spruce_sapling"],
            ["birch", "minecraft:birch_sapling"],
            ["jungle", "minecraft:jungle_sapling"],
            ["acacia", "minecraft:acacia_sapling"],
            ["dark_oak", "minecraft:dark_oak_sapling"],
            ["cherry", "minecraft:cherry_sapling"],
            ["mangrove", "minecraft:mangrove_propagule"],
            ["crimson", "minecraft:crimson_fungus"],
            ["warped", "minecraft:warped_fungus"],
        ]);

        this.breakPriority = 10;
    }

    onPlayerBreak(event) {
        const { player, block } = event;

        if (!player.isSneaking) return;
        if (!(block.typeId.includes("_log") || block.typeId.includes("_stem"))) return;

        const itemStack = player.getComponent("inventory").container.getItem(player.selectedSlotIndex);
        if (!itemStack || !itemStack.hasTag("minecraft:is_axe")) return;

        if (player.hasTag("tree_felling")) return;

        event.cancel = true;
        event.handled = true;
        system.run(() => this.startTreeFell(player, block));
    }
    /**
     *
     * @param {Player} player
     * @param {Block} startBlock
     */
    async startTreeFell(player, startBlock) {
        player.addTag("tree_felling");
        try {
            const originalBlockType = startBlock.typeId;
            const blocksToBreak = this.findTree(startBlock, this.maxBlocks);
            const inv = player.getComponent("inventory").container;
            const autoPickupModule = moduleManager.modules.get("AutoPickup");
            const isAutoPickupEnabled = autoPickupModule?.isEnabled;
            const dimension = player.dimension;

            for (const block of blocksToBreak) {
                const mainHandItem = inv.getItem(player.selectedSlotIndex);
                if (!mainHandItem || !mainHandItem.hasTag("minecraft:is_axe")) break;

                if (this.enableDurability && mainHandItem.getComponent("durability")) {
                    CTsAPI.utils.increaseDurability(player, mainHandItem, 1);
                }

                if (isAutoPickupEnabled) {
                    const lootItems = world.getLootTableManager().generateLootFromBlock(block, mainHandItem) ?? [];
                    world.gameRules.doTileDrops = false;
                    dimension.runCommand(`setblock ${block.location.x} ${block.location.y} ${block.location.z} air destroy`);
                    for (const item of lootItems) {
                        CTsAPI.utils.addItem(player, item);
                    }
                    world.gameRules.doTileDrops = true;
                } else {
                    dimension.runCommand(`setblock ${block.location.x} ${block.location.y} ${block.location.z} air destroy`);
                }
                await CTsAPI.utils.delay(this.delay);
            }

            if (this.fastLeafDecay) {
                await CTsAPI.utils.delay(1);
                this.decayLeaves(player.dimension, blocksToBreak);
            }

            if (this.replanter) {
                let woodType = null;
                for (const key of this.logToSaplingMap.keys()) {
                    if (originalBlockType.includes(key)) {
                        woodType = key;
                        break;
                    }
                }

                if (woodType) {
                    const saplingId = this.logToSaplingMap.get(woodType);
                    if (this.consumeSapling(player, saplingId)) {
                        try {
                            let topMostBlock = startBlock.dimension.getTopmostBlock(startBlock.location, startBlock.location.y);
                            const originalBlock = player.dimension.getBlock({ x: startBlock.location.x, y: topMostBlock.location.y + 1, z: startBlock.location.z });
                            if (originalBlock?.isAir) {
                                originalBlock.setType(saplingId);
                                player.dimension.playSound("dig.grass", originalBlock.location);
                            }
                        } catch (e) {
                            console.warn(`[TreeCapitator] Failed to replant ${saplingId}. The ground may not be suitable.`);
                        }
                    }
                }
            }
        } catch (e) {
            console.error(`[TreeCapitator] An error occurred: ${e.stack ?? e}`);
        } finally {
            player.removeTag("tree_felling");
        }
    }

    consumeSapling(player, saplingId) {
        const inventory = player.getComponent("inventory").container;
        for (let i = 0; i < inventory.size; i++) {
            const item = inventory.getItem(i);
            if (item?.typeId === saplingId) {
                if (item.amount > 1) (item.amount--, inventory.setItem(i, item));
                else inventory.setItem(i, undefined);
                return true;
            }
        }
        return false;
    }

    findTree(startBlock, limit) {
        const blockType = startBlock.typeId;
        const dimension = startBlock.dimension;
        const foundBlocks = [];
        const queue = [startBlock];
        const visited = new Set([CTsAPI.utils.locationToString(startBlock.location)]);

        while (queue.length > 0 && foundBlocks.length < limit) {
            const currentBlock = queue.shift();
            foundBlocks.push(currentBlock);

            for (let x = -1; x <= 1; x++) {
                for (let y = -1; y <= 1; y++) {
                    for (let z = -1; z <= 1; z++) {
                        if (x === 0 && y === 0 && z === 0) continue;
                        const neighborLocation = { x: currentBlock.location.x + x, y: currentBlock.location.y + y, z: currentBlock.location.z + z };
                        const locString = CTsAPI.utils.locationToString(neighborLocation);
                        if (visited.has(locString)) continue;
                        visited.add(locString);
                        try {
                            const neighborBlock = dimension.getBlock(neighborLocation);
                            if (neighborBlock?.typeId === blockType) queue.push(neighborBlock);
                        } catch (e) {}
                    }
                }
            }
        }
        return foundBlocks;
    }

    async decayLeaves(dimension, brokenLogs) {
        const decayDistance = 6;
        const brokenLogLocations = new Set(brokenLogs.map((b) => CTsAPI.utils.locationToString(b.location)));

        if (brokenLogs.length === 0) return;

        const searchRadius = 6;
        let minX = Infinity,
            maxX = -Infinity,
            minY = Infinity,
            maxY = -Infinity,
            minZ = Infinity,
            maxZ = -Infinity;

        for (const log of brokenLogs) {
            const loc = log.location;
            minX = Math.min(minX, loc.x);
            maxX = Math.max(maxX, loc.x);
            minY = Math.min(minY, loc.y);
            maxY = Math.max(maxY, loc.y);
            minZ = Math.min(minZ, loc.z);
            maxZ = Math.max(maxZ, loc.z);
        }

        minX -= searchRadius;
        maxX += searchRadius;
        minY -= searchRadius;
        maxY += searchRadius;
        minZ -= searchRadius;
        maxZ += searchRadius;

        const potentialLeaves = new Map();
        const anchorLogs = [];
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                for (let z = minZ; z <= maxZ; z++) {
                    try {
                        const block = dimension.getBlock({ x, y, z });
                        if (!block) continue;
                        const locString = CTsAPI.utils.locationToString(block.location);

                        if (
                            (block.typeId.includes("leaves") && block.permutation.getState("update_bit") === true) ||
                            block.typeId.includes("wart_block") ||
                            block.typeId.includes("shroomlight")
                        ) {
                            potentialLeaves.set(locString, block);
                        } else if ((block.typeId.includes("log") || block.typeId.includes("stem")) && !brokenLogLocations.has(locString)) {
                            anchorLogs.push(block);
                        }
                    } catch (e) {}
                }
            }
            if (y % 4 === 0) await CTsAPI.utils.delay(1);
        }

        const supportedLeaves = new Set();
        const queue = [];
        const visited = new Set();

        for (const log of anchorLogs) {
            for (let x = -1; x <= 1; x++) {
                for (let y = -1; y <= 1; y++) {
                    for (let z = -1; z <= 1; z++) {
                        if (x === 0 && y === 0 && z === 0) continue;
                        const neighborLoc = { x: log.location.x + x, y: log.location.y + y, z: log.location.z + z };
                        const neighborLocString = CTsAPI.utils.locationToString(neighborLoc);
                        if (potentialLeaves.has(neighborLocString) && !visited.has(neighborLocString)) {
                            queue.push({ loc: neighborLoc, dist: 0 });
                            visited.add(neighborLocString);
                            supportedLeaves.add(neighborLocString);
                        }
                    }
                }
            }
        }

        let processedInTick = 0;
        while (queue.length > 0) {
            const { loc, dist } = queue.shift();
            processedInTick++;

            if (dist >= decayDistance) continue;

            for (let x = -1; x <= 1; x++) {
                for (let y = -1; y <= 1; y++) {
                    for (let z = -1; z <= 1; z++) {
                        if (x === 0 && y === 0 && z === 0) continue;
                        const neighborLoc = { x: loc.x + x, y: loc.y + y, z: loc.z + z };
                        const neighborLocString = CTsAPI.utils.locationToString(neighborLoc);

                        if (potentialLeaves.has(neighborLocString) && !visited.has(neighborLocString)) {
                            visited.add(neighborLocString);
                            supportedLeaves.add(neighborLocString);
                            queue.push({ loc: neighborLoc, dist: dist + 1 });
                        }
                    }
                }
            }

            if (processedInTick > 200) {
                await CTsAPI.utils.delay(1);
                processedInTick = 0;
            }
        }

        const leavesToBreak = [];
        for (const [locString, block] of potentialLeaves.entries()) {
            if (!supportedLeaves.has(locString)) {
                leavesToBreak.push(block);
            }
        }

        const breakBatchSize = 100;
        for (let i = 0; i < leavesToBreak.length; i++) {
            const leaf = leavesToBreak[i];
            dimension.runCommand(`setblock ${leaf.location.x} ${leaf.location.y} ${leaf.location.z} air destroy`);
            if (i > 0 && i % breakBatchSize === 0) await CTsAPI.utils.delay(1);
        }
    }
}

moduleManager.registerModule(new TreeCapitatorModule());
