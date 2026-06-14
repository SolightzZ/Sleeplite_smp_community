import { TreeCapitatorBreakBlock } from "../module/treeCapitator/core/events.js";
import { VeinMiner } from "../module/veinMiner/core/events.js";
import { handleAutoReplant } from "../plugin/AutoReplant.js";
import { onBlockEdit } from "../module/protection/core/events.js";
import { router } from "./core/index.js";

router.on('beforePlayerBreakBlock', onBlockEdit);
router.on('beforePlayerBreakBlock', VeinMiner);

router.on('afterPlayerBreakBlock', handleAutoReplant);
router.on('afterPlayerBreakBlock', TreeCapitatorBreakBlock);
