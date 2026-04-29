import { world } from "@minecraft/server";
import { playerJoinNameTag } from "../plugin/NameTagRank";

world.afterEvents.playerJoin.subscribe(playerJoinNameTag);
