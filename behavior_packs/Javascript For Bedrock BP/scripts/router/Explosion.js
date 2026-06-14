import { onExplosion } from "../module/protection/core/events.js";
import { router } from "./core/index.js";

router.on('beforeExplosion', onExplosion);
