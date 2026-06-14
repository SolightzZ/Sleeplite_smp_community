import { touch } from '../module/endPortalFrame/play.js';
import { onBlockEdit } from '../module/protection/core/events.js';
import { handleRepairAnvil } from '../plugin/AnvilRepair.js';
import { openDoor } from '../plugin/OpenDoor.js';
import { router } from './core/index.js';

router.on('beforePlayerInteractBlock', touch);
router.on('beforePlayerInteractBlock', onBlockEdit);
router.on('beforePlayerInteractBlock', handleRepairAnvil);

router.on('afterPlayerInteractBlock', openDoor);
