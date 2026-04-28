import { world } from "@minecraft/server";
import { boardA, boardB } from "./data.js";

let objA, objB;

const board = (name) => {
  return (
    world.scoreboard.getObjective(name) ??
    world.scoreboard.addObjective(name, name)
  );
};

export const add = (player) => {
  if (!player || !player.isValid || !player.scoreboardIdentity) return;

  objA.addScore(player.scoreboardIdentity, 1);
  objB.addScore(`*${player.name}`, 1);
};

export const init = () => {
  objA = board(boardA);
  objB = board(boardB);
};
