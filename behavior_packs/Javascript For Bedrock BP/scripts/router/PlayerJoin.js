import { world } from "@minecraft/server";
import { chatRankPlayerJoin } from "../module/nametag/index.js";

world.afterEvents.playerSpawn.subscribe((ev) => {
  try {
    if (!ev.initialSpawn) return;
    const player = ev.player;
    if (!player || !player.isValid) return;
    chatRankPlayerJoin(ev);
  } catch (e) {
    console.warn("[ PlayerJoin ] player_join", String(e));
  }
});
