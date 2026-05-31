import { world } from "@minecraft/server";
import { flashSpawn } from "../module/flashlight/core/engine.js";
import { playerSpawnWelcome } from "../plugin/Welcome.js";
import { runEventHandlers } from "./utils.js";

const handlers = [playerSpawnWelcome, flashSpawn];

world.afterEvents.playerSpawn.subscribe((ev) => {
  const player = ev.player;
  if (!player || !player.isValid) return;
  runEventHandlers("PlayerSpawn", handlers, ev);
});
