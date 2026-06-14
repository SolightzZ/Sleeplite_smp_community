import { flashSpawn } from "../module/flashlight/core/engine.js";
import { playerSpawnWelcome } from "../plugin/Welcome.js";
import { router } from "./core/index.js";

router.on('afterPlayerSpawn', playerSpawnWelcome);
router.on('afterPlayerSpawn', flashSpawn);
