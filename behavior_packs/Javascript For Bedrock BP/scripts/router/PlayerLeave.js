import { playerLeaveAfk } from '../module/AFKCinematic/core/poller.js';
import { flashLeave } from '../module/flashlight/core/engine.js';
import { onLeaveFullBright } from '../module/fullBright/events.js';
import { onJobPlayerLeave } from '../module/jobs/Job.js';
import { onMagnetPlayerLeave } from '../module/magNet/core/events.js';
import { zoomPlayerLeave } from '../module/zoom/core.js';
import { onPlayerLeave } from '../module/protection/core/events.js';
import { cleanupPlayerState as cleanupTreeCapState } from '../module/treeCapitator/core/state.js';
import { cleanupPlayerState as cleanupVeinMinerState } from '../module/veinMiner/core/queue.js';
import { router } from './core/index.js';

router.on('beforePlayerLeave', onLeaveFullBright);
router.on('beforePlayerLeave', onPlayerLeave);

router.on('afterPlayerLeave', onMagnetPlayerLeave);
router.on('afterPlayerLeave', playerLeaveAfk);
router.on('afterPlayerLeave', flashLeave);
router.on('afterPlayerLeave', onJobPlayerLeave);
router.on('afterPlayerLeave', zoomPlayerLeave);
router.on('afterPlayerLeave', cleanupTreeCapState);
router.on('afterPlayerLeave', cleanupVeinMinerState);

