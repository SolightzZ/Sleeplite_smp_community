import { onBlockEdit } from "../module/protection/core/events.js";
import { router } from "./core/index.js";

router.on('beforePlayerPlaceBlock', onBlockEdit);
