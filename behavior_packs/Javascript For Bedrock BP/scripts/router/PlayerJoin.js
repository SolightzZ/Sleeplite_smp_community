import { chatRankPlayerJoin } from "../module/nametag/events.js";
import { onPlayerJoinCheckBan } from "../module/banPlayers/core/events.js";
import { router } from "./core/index.js";

router.on('afterPlayerJoin', chatRankPlayerJoin);
router.on('afterPlayerJoin', onPlayerJoinCheckBan);
