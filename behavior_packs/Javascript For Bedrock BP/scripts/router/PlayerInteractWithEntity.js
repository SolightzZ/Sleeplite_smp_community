import { onGravestoneInteract } from '../module/graveStones/core/interact.js';
import { onEntityInteract } from '../module/protection/core/events.js';
import { router } from '../events/index.js';

router.on('beforePlayerInteractEntity', onGravestoneInteract);
router.on('beforePlayerInteractEntity', onEntityInteract);
