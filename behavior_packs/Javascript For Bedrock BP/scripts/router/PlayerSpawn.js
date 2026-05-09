import { system, world } from "@minecraft/server";
import { flashSpawn } from "../module/flashlight/index.js";
import { playerSpawnWelcome } from "../plugin/Welcome.js";

const handlers = [playerSpawnWelcome, flashSpawn];

world.afterEvents.playerSpawn.subscribe((ev) => {
  try {
    const player = ev.player;
    if (!player || !player.isValid) return;

    system.run(() => {
      const len = handlers.length;
      for (let i = 0; i < len; i++) {
        const fn = handlers[i];
        if (fn) fn(ev);
      }
    });
  } catch (e) {
    console.warn("[ PlayerSpawn ] player_spawn", e.message);
  }
});
