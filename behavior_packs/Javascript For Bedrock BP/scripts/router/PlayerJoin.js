import { world } from "@minecraft/server";
import { playerJoinNameTag } from "../module/nameteg/index.js";

world.afterEvents.playerJoin.subscribe(playerJoinNameTag);
