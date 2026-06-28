import { onBlockEdit } from '../module/protection/core/events.js';
import { EventSpawnProtec } from '../module/spawnProtection/core/events.js';
import { TreeCapitatorBreakBlock } from '../module/treeCapitator/core/events.js';
import { VeinMiner } from '../module/veinMiner/core/events.js';
import { handleAutoReplant } from '../plugin/AutoReplant.js';
import { router } from '../events/index.js';

router.on('beforePlayerBreakBlock', EventSpawnProtec.edit('break'));
router.on('beforePlayerBreakBlock', onBlockEdit);
router.on('beforePlayerBreakBlock', VeinMiner);

router.on('afterPlayerBreakBlock', handleAutoReplant);
router.on('afterPlayerBreakBlock', TreeCapitatorBreakBlock);
