import { chatRankPlayerJoin } from "../module/nametag/events.js";
import { onPlayerJoinCheckBan } from "../module/banPlayers/core/events.js";
import { playerTimeJoin } from "../module/playerTime/index.js";
import { router } from "../events/index.js";

router.on('afterPlayerJoin', chatRankPlayerJoin);
router.on('afterPlayerJoin', onPlayerJoinCheckBan);
router.on('afterPlayerJoin', playerTimeJoin);
