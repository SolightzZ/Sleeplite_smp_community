import { system, world } from "@minecraft/server";
import { playerSpawnWelcome } from "../plugin/Welcome";
import { flashSpawn } from "../plugin/Flashlight.js";

const PLAYER_SPAWN = [playerSpawnWelcome, flashSpawn];

world.afterEvents.playerSpawn.subscribe((event) => {
  try {
    system.run(() => {
      for (let i = 0; i < PLAYER_SPAWN.length; i++) {
        const fn = PLAYER_SPAWN[i];
        if (fn) fn(event);
        event.cancel = true;
      }
    });
  } catch (error) {
    console.warn("player_spawn", error.message);
  }
});
