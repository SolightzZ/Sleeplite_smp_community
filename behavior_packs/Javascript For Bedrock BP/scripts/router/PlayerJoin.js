import { chatRankPlayerJoin } from "../module/nametag/events.js";
import { router } from "./core/index.js";

router.on('afterPlayerJoin', chatRankPlayerJoin);
