import { DeathCounter } from '../module/dropheads/event.js';
import { gravestone_main } from '../module/graveStones/core/spawner.js';
import { onMagnetPlayerDie } from '../module/magNet/core/events.js';
import { zoomEntityDie } from '../module/zoom/core.js';
import { router } from './core/index.js';

router.on('afterEntityDie', gravestone_main, { typeId: 'minecraft:player' });
router.on('afterEntityDie', DeathCounter, { typeId: 'minecraft:player' });
router.on('afterEntityDie', onMagnetPlayerDie, { typeId: 'minecraft:player' });
router.on('afterEntityDie', zoomEntityDie, { typeId: 'minecraft:player' });
