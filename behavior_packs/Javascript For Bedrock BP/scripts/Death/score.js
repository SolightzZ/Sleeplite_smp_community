import { world } from "@minecraft/server";
import { boardA, boardB } from "./data.js";

function board(name) {
  return world.scoreboard.getObjective(name) ?? world.scoreboard.addObjective(name, name);
}

export function add(player) {
  const IfPlayer = player?.scoreboardIdentity;
  if (!IfPlayer) return;

  board(boardA).addScore(player.scoreboardIdentity, 1);
  board(boardB).addScore(`*${player.name}`, 1);
}

export function init() {
  board(boardA);
  board(boardB);
}
