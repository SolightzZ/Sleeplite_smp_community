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
  if (!player || !player.isValid) return;
  try {
    objA.addScore(player, 1);
    objB.addScore(`*${player.name}`, 1);
  } catch {}
};

export const init = () => {
  try {
    objA = board(boardA);
    objB = board(boardB);
  } catch {}
};
