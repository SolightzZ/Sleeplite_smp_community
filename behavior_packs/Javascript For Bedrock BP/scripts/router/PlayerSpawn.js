import { flashSpawn } from "../module/flashlight/core/engine.js";
import { onPlayerSpawnFullBright } from "../module/fullBright/events.js";
import { playerSpawnWelcome } from "../plugin/Welcome.js";
import { router } from "../events/index.js";

router.on('afterPlayerSpawn', playerSpawnWelcome);
router.on('afterPlayerSpawn', flashSpawn);
router.on('afterPlayerSpawn', onPlayerSpawnFullBright);
