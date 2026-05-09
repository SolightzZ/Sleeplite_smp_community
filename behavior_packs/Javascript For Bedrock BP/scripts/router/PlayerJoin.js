import { world } from "@minecraft/server";
import { chatRankplayerJoin } from "../module/nameteg/index.js";

world.afterEvents.playerSpawn.subscribe(chatRankplayerJoin);
