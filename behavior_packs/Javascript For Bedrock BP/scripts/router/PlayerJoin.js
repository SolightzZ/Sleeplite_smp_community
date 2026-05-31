import { world } from "@minecraft/server";
import { chatRankPlayerJoin } from "../module/nametag/events.js";
import { runEventHandlers } from "./utils.js";

world.afterEvents.playerSpawn.subscribe((ev) => {
  if (!ev.initialSpawn) return;
  const player = ev.player;
  if (!player || !player.isValid) return;
  runEventHandlers("PlayerJoin", [chatRankPlayerJoin], ev);
});
