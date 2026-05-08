import { system, world } from "@minecraft/server";
import { flashSpawn } from "../module/flashlight/core/engine";
import { playerSpawnWelcome } from "../plugin/Welcome";

const PLAYER_SPAWN = [playerSpawnWelcome, flashSpawn];

world.afterEvents.playerSpawn.subscribe((event) => {
  try {
    system.run(() => {
      for (let i = 0; i < PLAYER_SPAWN.length; i++) {
        const fn = PLAYER_SPAWN[i];
        if (fn) fn(event);
      }
    });
  } catch (error) {
    console.warn("player_spawn", error.message);
  }
});
