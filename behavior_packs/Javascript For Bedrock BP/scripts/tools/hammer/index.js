import { world, system } from "@minecraft/server";
import { CONFIG } from "./constants.js";
import { generateGrid, sortByDistance } from "./math.js";
import { isValidTool, getEnchantData, isMineableBlock } from "./logic.js";
import { miningJobExecutor } from "./job.js";

const onHammerBreak = (event) => {
  const { player, itemStack, block } = event;

  if (!itemStack || !isValidTool(itemStack.typeId)) return;
  if (CONFIG.SNEAK_CANCEL && player.isSneaking) return;
  if (!isMineableBlock(block.typeId, block.getTags())) return;

  event.cancel = true;

  const center = block.location;
  const rotation = player.getRotation();
  const enchantData = getEnchantData(itemStack, player);

  const targets = generateGrid(center, rotation, CONFIG.RADIUS).sort(sortByDistance(center));

  system.runJob(miningJobExecutor(block.dimension, targets, enchantData, player));
};

world.beforeEvents.playerBreakBlock.subscribe(onHammerBreak);

console.warn("Hammer Module Loaded successfully");
