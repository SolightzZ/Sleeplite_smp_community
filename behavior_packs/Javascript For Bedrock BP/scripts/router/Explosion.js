import { onExplosion } from '../module/protection/core/events.js';
import { EventSpawnProtec } from '../module/spawnProtection/core/events.js';
import { router } from './core/index.js';

router.on('beforeExplosion', EventSpawnProtec.explosion);
router.on('beforeExplosion', onExplosion);
