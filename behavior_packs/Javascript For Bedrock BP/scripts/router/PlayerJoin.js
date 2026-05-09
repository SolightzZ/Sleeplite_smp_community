import { world } from "@minecraft/server";
import { chatRankplayerJoin } from "../module/nameteg/index.js";

world.afterEvents.playerSpawn.subscribe((ev) => {
  try {
    const player = ev.player;
    if (!player || !player.isValid) return;
    chatRankplayerJoin(ev);
  } catch (e) {
    console.warn("player_join", e.message);
  }
});
