import { onBlockEdit } from '../module/protection/core/events.js';
import { EventSpawnProtec } from '../module/spawnProtection/core/events.js';
import { router } from '../events/index.js';

router.on('beforePlayerPlaceBlock', EventSpawnProtec.edit('place'));
router.on('beforePlayerPlaceBlock', onBlockEdit);
