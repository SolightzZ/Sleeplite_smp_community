import { world } from "@minecraft/server";
import { playerSpawnWelcome } from "../plugin/Welcome";

world.afterEvents.playerSpawn.subscribe(playerSpawnWelcome);
