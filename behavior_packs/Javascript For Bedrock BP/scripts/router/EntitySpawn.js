import { itile_main } from '../plugin/title.js';
import { router } from '../events/index.js';

router.on('afterEntitySpawn', itile_main, { typeId: 'minecraft:ender_dragon' });
router.on('afterEntitySpawn', itile_main, { typeId: 'minecraft:wither' });
